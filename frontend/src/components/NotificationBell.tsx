import { useState, useEffect, useRef } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import {
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    type Notification,
} from "../lib/api";
import socket from "../lib/socket";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await fetchNotifications();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        const handleNewNotification = (data: { notification: Notification }) => {
            setNotifications((prev) => [data.notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };

        socket.on("newNotification", handleNewNotification);
        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // silently fail
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            // silently fail
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "booking_request":
                return "📩";
            case "booking_accepted":
                return "✅";
            case "booking_rejected":
                return "❌";
            default:
                return "🔔";
        }
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
                        <h3 className="text-white font-semibold text-sm">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors ${!notification.isRead ? "bg-violet-500/5" : ""
                                        }`}
                                >
                                    <span className="text-lg mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm leading-snug ${!notification.isRead
                                                    ? "text-gray-200"
                                                    : "text-gray-400"
                                                }`}
                                        >
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            {timeAgo(notification.createdAt)}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="p-1 text-gray-500 hover:text-violet-400 transition-colors flex-shrink-0"
                                            title="Mark as read"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
