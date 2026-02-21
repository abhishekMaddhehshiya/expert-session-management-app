import { useState, useEffect } from "react";
import {
    CalendarDays,
    Clock,
    User,
    Loader2,
    Inbox,
    AlertCircle,
    Ban,
} from "lucide-react";
import { fetchMyBookings, cancelBooking as cancelBookingApi, type Booking } from "../lib/api";
import toast from "react-hot-toast";
import socket from "../lib/socket";

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const loadBookings = async () => {
        try {
            setError("");
            const data = await fetchMyBookings();
            setBookings(data);
        } catch {
            setError("Failed to fetch bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    // Listen for real-time booking status updates
    useEffect(() => {
        const handleStatusUpdate = (data: { bookingId: string; status: string }) => {
            setBookings((prev) =>
                prev.map((b) =>
                    b._id === data.bookingId
                        ? { ...b, status: data.status as Booking["status"] }
                        : b
                )
            );
        };

        socket.on("bookingStatusUpdate", handleStatusUpdate);
        return () => {
            socket.off("bookingStatusUpdate", handleStatusUpdate);
        };
    }, []);

    const handleCancel = async (bookingId: string) => {
        setCancellingId(bookingId);
        try {
            await cancelBookingApi(bookingId);
            setBookings((prev) =>
                prev.map((b) =>
                    b._id === bookingId ? { ...b, status: "rejected" as const } : b
                )
            );
            toast.success("Booking cancelled. The time slot is now freed up.");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to cancel booking");
        } finally {
            setCancellingId(null);
        }
    };

    const statusConfig: Record<
        string,
        { label: string; color: string; bg: string }
    > = {
        pending: {
            label: "Pending",
            color: "text-amber-400",
            bg: "bg-amber-500/10 border-amber-500/20",
        },
        confirmed: {
            label: "Confirmed",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10 border-emerald-500/20",
        },
        rejected: {
            label: "Cancelled",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
        },
        completed: {
            label: "Completed",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
        },
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading your bookings...</p>
            </div>
        );
    }

    const activeBookings = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
    const pastBookings = bookings.filter((b) => b.status === "rejected" || b.status === "completed");

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
                My{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Bookings
                </span>
            </h1>
            <p className="text-gray-400 mb-8">
                View and manage your session bookings
            </p>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                    <button
                        onClick={() => { setLoading(true); loadBookings(); }}
                        className="ml-auto text-sm text-violet-400 hover:text-violet-300 underline"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!error && bookings.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-gray-400 text-lg font-medium">
                        No bookings yet
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Book a session with an expert to get started
                    </p>
                </div>
            )}

            {/* Active Bookings */}
            {activeBookings.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold text-white mb-4">
                        Active Bookings
                        <span className="text-sm font-normal text-gray-400 ml-2">({activeBookings.length})</span>
                    </h2>
                    <div className="space-y-4">
                        {activeBookings.map((booking) => {
                            const statusInfo = statusConfig[booking.status] || statusConfig.pending;
                            const isCancelling = cancellingId === booking._id;
                            return (
                                <div
                                    key={booking._id}
                                    className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-colors"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-semibold text-lg">
                                                    {booking.expertName}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color}`}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-gray-400 text-sm">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    {booking.date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.timeSlot}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            disabled={isCancelling}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-sm font-medium disabled:opacity-50 flex-shrink-0"
                                        >
                                            {isCancelling ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Ban className="w-4 h-4" />
                                            )}
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {booking.userName}
                                        </span>
                                    </div>

                                    {booking.notes && (
                                        <p className="mt-3 text-gray-500 text-sm bg-gray-800/30 rounded-lg p-3 border border-gray-800/50">
                                            {booking.notes}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">
                        Past Bookings
                    </h2>
                    <div className="space-y-3">
                        {pastBookings.map((booking) => {
                            const statusInfo = statusConfig[booking.status] || statusConfig.pending;
                            return (
                                <div
                                    key={booking._id}
                                    className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-4"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-medium">{booking.expertName}</span>
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    {booking.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {booking.timeSlot}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
