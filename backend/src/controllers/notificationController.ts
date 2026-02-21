import type { Response } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification.ts";
import type { AuthRequest } from "../middleware/authMiddleware.ts";

// GET /api/notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId,
            isRead: false,
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const notification = await Notification.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(req.params.id as string), userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        res.json({ message: "Notification marked as read", notification });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Failed to update notification" });
    }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Failed to update notifications" });
    }
};
