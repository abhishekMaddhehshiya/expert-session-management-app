import type { Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.ts";
import Expert from "../models/Expert.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

// Generate 7 days of hourly slots (8 AM – 8 PM) starting from tomorrow
function generateDefaultSlots(): { date: string; time: string; isBooked: boolean }[] {
    const slots: { date: string; time: string; isBooked: boolean }[] = [];
    const today = new Date();

    for (let day = 1; day <= 7; day++) {
        const d = new Date(today);
        d.setDate(d.getDate() + day);
        const dateStr = d.toISOString().split("T")[0]!; // YYYY-MM-DD

        for (let hour = 8; hour <= 20; hour++) {
            const time = `${String(hour).padStart(2, "0")}:00`;
            slots.push({ date: dateStr, time, isBooked: false });
        }
    }
    return slots;
}

const generateToken = (userId: string, role: string): string => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET || "fallback_secret_key_change_me", {
        expiresIn: "7d",
    });
};

// POST /api/auth/signup
export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, phone, category, bio, experience } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400).json({ message: "Name, email, password, and role are required" });
            return;
        }

        if (!["user", "expert"].includes(role)) {
            res.status(400).json({ message: "Role must be 'user' or 'expert'" });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: "Email already registered" });
            return;
        }

        // Create user
        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role,
            phone: phone || "",
        });
        await user.save();

        // If expert, create Expert profile
        if (role === "expert") {
            if (!category) {
                res.status(400).json({ message: "Category is required for experts" });
                return;
            }

            const expert = new Expert({
                userId: user._id,
                name,
                category,
                bio: bio || "",
                experience: experience || 0,
                rating: 0,
                profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.toLowerCase().replace(/\s/g, "")}`,
                availableSlots: generateDefaultSlots(),
            });
            await expert.save();
        }

        const token = generateToken(String(user._id), user.role);

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Failed to create account" });
    }
};

// POST /api/auth/login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return;
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }

        const token = generateToken(String(user._id), user.role);

        res.json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId).select("-password");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
        });
    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({ message: "Failed to fetch user" });
    }
};
