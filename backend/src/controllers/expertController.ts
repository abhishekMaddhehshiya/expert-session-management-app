import type { Request, Response } from "express";
import Expert from "../models/Expert.ts";
import Booking from "../models/Booking.ts";
import User from "../models/User.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

// Helper: Generate all time slots for next 7 days (8AM - 8PM)
function generateAllSlots(): { date: string; time: string }[] {
    const slots: { date: string; time: string }[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0]!;
        
        for (let hour = 8; hour <= 20; hour++) {
            const timeStr = `${String(hour).padStart(2, "0")}:00`;
            slots.push({ date: dateStr, time: timeStr });
        }
    }
    return slots;
}

// GET /api/experts?page=1&limit=8&search=&category=
export const getExperts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 8;
        const search = (req.query.search as string) || "";
        const category = (req.query.category as string) || "";

        const query: Record<string, unknown> = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category) {
            query.category = category;
        }

        const total = await Expert.countDocuments(query);
        const experts = await Expert.find(query)
            .select("-blockedSlots")
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ rating: -1 });

        res.json({
            experts,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalExperts: total,
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        console.error("Error fetching experts:", error);
        res.status(500).json({ message: "Failed to fetch experts" });
    }
};

// GET /api/experts/:id
export const getExpertById = async (req: Request, res: Response): Promise<void> => {
    try {
        const expert = await Expert.findById(req.params.id);
        if (!expert) {
            res.status(404).json({ message: "Expert not found" });
            return;
        }

        // Get expert's user account for email and phone
        const expertUser = await User.findById(expert.userId).select("email phone");

        // Get confirmed/pending bookings
        const bookings = await Booking.find({ expertId: expert._id, status: { $in: ["confirmed", "pending"] } });
        const bookedSlots = new Set(bookings.map((b) => `${b.date}_${b.timeSlot}`));
        
        // Get blocked slots set
        const blockedSlots = new Set(expert.blockedSlots.map((s) => `${s.date}_${s.time}`));

        // Generate all slots and mark availability
        const allSlots = generateAllSlots();
        const slotsWithStatus = allSlots.map((slot) => ({
            date: slot.date,
            time: slot.time,
            isBooked: bookedSlots.has(`${slot.date}_${slot.time}`) || blockedSlots.has(`${slot.date}_${slot.time}`),
        }));

        res.json({
            ...expert.toObject(),
            email: expertUser?.email || "",
            phone: expertUser?.phone || "",
            availableSlots: slotsWithStatus,
        });
    } catch (error) {
        console.error("Error fetching expert:", error);
        res.status(500).json({ message: "Failed to fetch expert details" });
    }
};

// GET /api/experts/categories
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Expert.distinct("category");
        res.json(categories);
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories" });
    }
};

// GET /api/experts/my-slots — expert fetches their own slots
export const getMySlots = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const expert = await Expert.findOne({ userId: req.user!.userId });
        if (!expert) {
            res.status(404).json({ message: "Expert profile not found" });
            return;
        }

        // Get bookings to mark which slots are booked
        const bookings = await Booking.find({ expertId: expert._id, status: { $in: ["confirmed", "pending"] } });
        const bookedSlots = new Set(bookings.map((b) => `${b.date}_${b.timeSlot}`));
        
        // Get blocked slots
        const blockedSlots = new Set(expert.blockedSlots.map((s) => `${s.date}_${s.time}`));

        // Generate all slots and determine status
        const allSlots = generateAllSlots();
        const slotsWithStatus = allSlots.map((slot) => {
            const key = `${slot.date}_${slot.time}`;
            return {
                date: slot.date,
                time: slot.time,
                isBooked: bookedSlots.has(key),
                isBlocked: blockedSlots.has(key),
            };
        });

        res.json({ slots: slotsWithStatus });
    } catch (error) {
        console.error("Error fetching my slots:", error);
        res.status(500).json({ message: "Failed to fetch slots" });
    }
};

// POST /api/experts/my-slots/toggle — expert toggles a slot's blocked status
export const toggleSlot = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { date, time } = req.body;
        if (!date || !time) {
            res.status(400).json({ message: "date and time are required" });
            return;
        }

        const expert = await Expert.findOne({ userId: req.user!.userId });
        if (!expert) {
            res.status(404).json({ message: "Expert profile not found" });
            return;
        }

        const existingIndex = expert.blockedSlots.findIndex(
            (s) => s.date === date && s.time === time
        );

        if (existingIndex >= 0) {
            // Slot is blocked → unblock it (make available)
            expert.blockedSlots.splice(existingIndex, 1);
            await expert.save();
            res.json({ message: "Slot is now available", available: true });
        } else {
            // Slot is not blocked → block it
            // First check if there's an active booking
            const hasBooking = await Booking.findOne({
                expertId: expert._id,
                date,
                timeSlot: time,
                status: { $in: ["confirmed", "pending"] },
            });
            if (hasBooking) {
                res.status(400).json({ message: "Cannot block a slot that has an active booking" });
                return;
            }

            expert.blockedSlots.push({ date, time });
            expert.blockedSlots.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
            await expert.save();
            res.json({ message: "Slot is now blocked", available: false });
        }
    } catch (error) {
        console.error("Error toggling slot:", error);
        res.status(500).json({ message: "Failed to toggle slot" });
    }
};
