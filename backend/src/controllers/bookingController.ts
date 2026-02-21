import type { Response } from "express";
import Booking from "../models/Booking.ts";
import Expert from "../models/Expert.ts";
import User from "../models/User.ts";
import Notification from "../models/Notification.ts";
import { getIO } from "../socket.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

// POST /api/bookings — Create a booking (user only)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { expertId, date, timeSlot, notes } = req.body;

        if (!expertId || !date || !timeSlot) {
            res.status(400).json({ message: "expertId, date, and timeSlot are required" });
            return;
        }

        // Get logged-in user
        const authUserId = req.user!.userId;
        const user = await User.findById(authUserId);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        // Prevent experts from booking other experts
        if (user.role === "expert") {
            res.status(403).json({ message: "Experts cannot book sessions with other experts" });
            return;
        }

        // Verify expert exists
        const expert = await Expert.findById(expertId);
        if (!expert) {
            res.status(404).json({ message: "Expert not found" });
            return;
        }

        // Check if the slot is blocked by the expert
        const isSlotBlocked = expert.blockedSlots.some(
            (slot) => slot.date === date && slot.time === timeSlot
        );
        if (isSlotBlocked) {
            res.status(400).json({ message: "This time slot is not available" });
            return;
        }

        // Attempt to create booking
        try {
            const booking = new Booking({
                expertId,
                userId: user._id,
                expertName: expert.name,
                userName: user.name,
                email: user.email,
                phone: user.phone,
                date,
                timeSlot,
                notes: notes || "",
                status: "pending",
            });

            await booking.save();

            // Create notification for expert
            const expertUser = await User.findById(expert.userId);
            if (expertUser) {
                const notification = new Notification({
                    userId: expertUser._id,
                    type: "booking_request",
                    message: `New booking request from ${user.name} for ${date} at ${timeSlot}`,
                    bookingId: booking._id,
                });
                await notification.save();

                // Emit real-time notification to expert
                const io = getIO();
                io.to(String(expertUser._id)).emit("newNotification", {
                    notification: notification.toObject(),
                });
            }

            // Emit slot booked event
            const io = getIO();
            io.emit("slotBooked", {
                expertId,
                date,
                timeSlot,
                bookingId: booking._id,
            });

            res.status(201).json({
                message: "Booking request submitted successfully",
                booking,
            });
        } catch (err: unknown) {
            if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
                res.status(409).json({
                    message: "This time slot has already been booked. Please select another slot.",
                });
                return;
            }
            throw err;
        }
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: "Failed to create booking" });
    }
};

// PATCH /api/bookings/:id/respond — Expert accepts/rejects
export const respondToBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { status } = req.body;

        if (!status || !["confirmed", "rejected"].includes(status)) {
            res.status(400).json({ message: "Status must be 'confirmed' or 'rejected'" });
            return;
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        // Verify this expert owns the booking
        const authUserId = req.user!.userId;
        const expert = await Expert.findOne({ userId: authUserId });
        if (!expert || String(booking.expertId) !== String(expert._id)) {
            res.status(403).json({ message: "Not authorized to respond to this booking" });
            return;
        }

        if (booking.status !== "pending") {
            res.status(400).json({ message: "Booking has already been responded to" });
            return;
        }

        booking.status = status;
        await booking.save();

        // If rejected, free the slot back (remove the unique booking constraint)
        if (status === "rejected") {
            // Slot becomes available again since the booking is rejected
            // The unique index prevents re-booking, so we delete the rejected booking
            // Actually, we keep it for history. The slot availability check uses confirmed bookings.
        }

        // Create notification for the user
        const notificationType = status === "confirmed" ? "booking_accepted" : "booking_rejected";
        const notificationMessage = status === "confirmed"
            ? `Your booking with ${expert.name} for ${booking.date} at ${booking.timeSlot} has been confirmed!`
            : `Your booking with ${expert.name} for ${booking.date} at ${booking.timeSlot} has been rejected.`;

        const notification = new Notification({
            userId: booking.userId,
            type: notificationType,
            message: notificationMessage,
            bookingId: booking._id,
        });
        await notification.save();

        // Emit real-time notification to user
        const io = getIO();
        io.to(String(booking.userId)).emit("newNotification", {
            notification: notification.toObject(),
        });

        // Also emit booking status update for real-time UI updates
        io.to(String(booking.userId)).emit("bookingStatusUpdate", {
            bookingId: booking._id,
            status,
        });

        res.json({ message: `Booking ${status}`, booking });
    } catch (error) {
        console.error("Error responding to booking:", error);
        res.status(500).json({ message: "Failed to respond to booking" });
    }
};

// GET /api/bookings — Get bookings for logged-in user
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const bookings = await Booking.find({ userId }).sort({
            createdAt: -1,
        });
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// GET /api/bookings/expert — Get bookings for logged-in expert
export const getExpertBookings = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const expert = await Expert.findOne({ userId });
        if (!expert) {
            res.status(404).json({ message: "Expert profile not found" });
            return;
        }

        const bookings = await Booking.find({ expertId: expert._id }).sort({
            createdAt: -1,
        });
        res.json(bookings);
    } catch (error) {
        console.error("Error fetching expert bookings:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// PATCH /api/bookings/:id/cancel — Cancel a booking (user or expert)
export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            res.status(404).json({ message: "Booking not found" });
            return;
        }

        const authUserId = req.user!.userId;
        const authRole = req.user!.role;

        // Verify the user owns this booking OR is the expert for it
        let isExpert = false;
        if (authRole === "expert") {
            const expert = await Expert.findOne({ userId: authUserId });
            if (expert && String(booking.expertId) === String(expert._id)) {
                isExpert = true;
            }
        }

        const isUser = String(booking.userId) === authUserId;

        if (!isUser && !isExpert) {
            res.status(403).json({ message: "Not authorized to cancel this booking" });
            return;
        }

        if (booking.status === "cancelled") {
            res.status(400).json({ message: "Booking is already cancelled" });
            return;
        }

        booking.status = "cancelled";
        await booking.save();

        // Get expert for notifications
        const expert = await Expert.findById(booking.expertId);

        // Send notification to the other party
        const io = getIO();
        const cancelledBy = isExpert ? "expert" : "user";
        const cancellerName = isExpert ? booking.expertName : booking.userName;

        if (isExpert) {
            // Notify the user
            const notification = new Notification({
                userId: booking.userId,
                type: "booking_cancelled",
                message: `Your booking with ${booking.expertName} for ${booking.date} at ${booking.timeSlot} has been cancelled by the expert.`,
                bookingId: booking._id,
            });
            await notification.save();
            io.to(String(booking.userId)).emit("newNotification", {
                notification: notification.toObject(),
            });
        } else {
            // Notify the expert
            const expertUser = expert ? await User.findById(expert.userId) : null;
            if (expertUser) {
                const notification = new Notification({
                    userId: expertUser._id,
                    type: "booking_cancelled",
                    message: `Booking from ${booking.userName} for ${booking.date} at ${booking.timeSlot} has been cancelled by the ${cancelledBy}.`,
                    bookingId: booking._id,
                });
                await notification.save();
                io.to(String(expertUser._id)).emit("newNotification", {
                    notification: notification.toObject(),
                });
            }
        }

        // Emit booking status update
        io.to(String(booking.userId)).emit("bookingStatusUpdate", {
            bookingId: booking._id,
            status: "cancelled",
            cancelledBy,
        });

        // Also emit slot freed event
        io.emit("slotFreed", {
            expertId: String(booking.expertId),
            date: booking.date,
            timeSlot: booking.timeSlot,
        });

        res.json({ message: `Booking cancelled by ${cancellerName}`, booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: "Failed to cancel booking" });
    }
};

