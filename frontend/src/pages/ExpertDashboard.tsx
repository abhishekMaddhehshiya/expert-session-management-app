import { useState, useEffect, useCallback } from "react";
import {
    CalendarDays,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    Loader2,
    Inbox,
    AlertCircle,
    Ban,
} from "lucide-react";
import {
    fetchExpertBookings,
    respondToBooking,
    cancelBooking as cancelBookingApi,
    fetchMySlots,
    toggleSlot,
    type Booking,
    type TimeSlot,
} from "../lib/api";
import toast from "react-hot-toast";
import socket from "../lib/socket";

type TabType = "bookings" | "availability";

// All possible hours 8AM-8PM
const ALL_HOURS = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return `${String(hour).padStart(2, "0")}:00`;
});

// Generate 7 days starting from today
function getNext7Days(): string[] {
    const days: string[] = [];
    const today = new Date();
    for (let i = 0; i <= 6; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i + 1);
        days.push(d.toISOString().split("T")[0]!);
    }
    return days;
}

export default function ExpertDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>("bookings");

    // --- Bookings ---
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState("");
    const [respondingId, setRespondingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // --- Slots ---
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [slotError, setSlotError] = useState("");
    const [togglingSlot, setTogglingSlot] = useState<string | null>(null);

    const loadBookings = useCallback(async () => {
        try {
            setBookingError("");
            const data = await fetchExpertBookings();
            setBookings(data);
        } catch {
            setBookingError("Failed to load bookings");
        } finally {
            setLoadingBookings(false);
        }
    }, []);

    const loadSlots = useCallback(async () => {
        try {
            setSlotError("");
            const data = await fetchMySlots();
            setSlots(data.slots);
        } catch {
            setSlotError("Failed to load slots");
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
        loadSlots();
    }, [loadBookings, loadSlots]);

    useEffect(() => {
        const handleNewNotification = () => {
            loadBookings();
            loadSlots();
        };
        socket.on("newNotification", handleNewNotification);
        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [loadBookings, loadSlots]);

    // --- Handlers ---
    const handleRespond = async (bookingId: string, status: "confirmed" | "rejected") => {
        setRespondingId(bookingId);
        try {
            await respondToBooking(bookingId, status);
            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
            );
            toast.success(status === "confirmed" ? "Booking confirmed!" : "Booking rejected.");
            loadSlots();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to respond");
        } finally {
            setRespondingId(null);
        }
    };

    const handleCancel = async (bookingId: string) => {
        setCancellingId(bookingId);
        try {
            await cancelBookingApi(bookingId);
            setBookings((prev) =>
                prev.map((b) => (b._id === bookingId ? { ...b, status: "rejected" as const } : b))
            );
            toast.success("Booking cancelled. Time slot is now available again.");
            loadSlots();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to cancel");
        } finally {
            setCancellingId(null);
        }
    };

    const handleToggleSlot = async (date: string, time: string) => {
        const key = `${date}_${time}`;
        setTogglingSlot(key);
        try {
            const result = await toggleSlot({ date, time });
            // Update local state based on response
            setSlots((prev) =>
                prev.map((s) =>
                    s.date === date && s.time === time
                        ? { ...s, isBlocked: !result.available }
                        : s
                )
            );
            toast.success(result.available ? "Slot is now available" : "Slot is now blocked");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to toggle slot");
        } finally {
            setTogglingSlot(null);
        }
    };

    // --- Derived data ---
    const pendingBookings = bookings.filter((b) => b.status === "pending");
    const activeBookings = bookings.filter((b) => b.status === "confirmed");
    const pastBookings = bookings.filter((b) => b.status === "rejected" || b.status === "completed");
    const next7Days = getNext7Days();

    // Build lookup maps for slots
    const slotMap = new Map(slots.map((s) => [`${s.date}_${s.time}`, s]));

    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
        pending: { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        rejected: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        completed: { label: "Completed", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const tmrw = new Date(todayDate);
        tmrw.setDate(tmrw.getDate() + 1);
        if (date.getTime() === todayDate.getTime()) return "Today";
        if (date.getTime() === tmrw.getTime()) return "Tomorrow";
        return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
                Expert{" "}
                <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Dashboard
                </span>
            </h1>
            <p className="text-gray-400 mb-6">Manage your bookings and availability</p>

            {/* Tab Switcher */}
            <div className="flex gap-1 mb-8 bg-gray-900/60 border border-gray-800/50 rounded-xl p-1 w-fit">
                <button
                    onClick={() => setActiveTab("bookings")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "bookings"
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                        }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    Bookings
                    {pendingBookings.length > 0 && (
                        <span className="ml-1 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {pendingBookings.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("availability")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "availability"
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                            : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Availability
                </button>
            </div>

            {/* ========== BOOKINGS TAB ========== */}
            {activeTab === "bookings" && (
                <>
                    {loadingBookings ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                            <p className="text-gray-400">Loading bookings...</p>
                        </div>
                    ) : bookingError ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{bookingError}</p>
                        </div>
                    ) : (
                        <>
                            {/* Pending Requests */}
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                    Pending Requests
                                    {pendingBookings.length > 0 && (
                                        <span className="text-sm font-normal text-gray-400">({pendingBookings.length})</span>
                                    )}
                                </h2>

                                {pendingBookings.length === 0 ? (
                                    <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6 text-center">
                                        <Inbox className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                        <p className="text-gray-400 text-sm">No pending requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {pendingBookings.map((b) => (
                                            <BookingCard
                                                key={b._id}
                                                booking={b}
                                                statusConfig={statusConfig}
                                                onAccept={() => handleRespond(b._id, "confirmed")}
                                                onReject={() => handleRespond(b._id, "rejected")}
                                                loading={respondingId === b._id}
                                                showActions="respond"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Confirmed Bookings */}
                            {activeBookings.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-lg font-bold text-white mb-4">Confirmed Bookings</h2>
                                    <div className="space-y-3">
                                        {activeBookings.map((b) => (
                                            <BookingCard
                                                key={b._id}
                                                booking={b}
                                                statusConfig={statusConfig}
                                                onCancel={() => handleCancel(b._id)}
                                                loading={cancellingId === b._id}
                                                showActions="cancel"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Bookings */}
                            {pastBookings.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-4">Booking History</h2>
                                    <div className="space-y-3">
                                        {pastBookings.map((b) => (
                                            <BookingCard key={b._id} booking={b} statusConfig={statusConfig} showActions="none" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {bookings.length === 0 && (
                                <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-8 text-center">
                                    <Inbox className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No bookings yet</p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ========== AVAILABILITY TAB ========== */}
            {activeTab === "availability" && (
                <>
                    <p className="text-gray-400 text-sm mb-6">
                        All time slots are <span className="text-emerald-400">available by default</span>. Click a slot to{" "}
                        <span className="text-red-400">block</span> it, or click a blocked slot to make it available again.
                        Slots with active bookings cannot be modified.
                    </p>

                    {loadingSlots ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                            <p className="text-gray-400">Loading availability...</p>
                        </div>
                    ) : slotError ? (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{slotError}</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {next7Days.map((date) => {
                                const availableCount = ALL_HOURS.filter((t) => {
                                    const slot = slotMap.get(`${date}_${t}`);
                                    return slot && !slot.isBooked && !slot.isBlocked;
                                }).length;
                                const bookedCount = ALL_HOURS.filter((t) => {
                                    const slot = slotMap.get(`${date}_${t}`);
                                    return slot && slot.isBooked;
                                }).length;
                                const blockedCount = ALL_HOURS.filter((t) => {
                                    const slot = slotMap.get(`${date}_${t}`);
                                    return slot && slot.isBlocked && !slot.isBooked;
                                }).length;

                                return (
                                    <div key={date} className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4 text-violet-400" />
                                                {formatDate(date)}
                                                <span className="text-gray-500 font-normal">({date})</span>
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    {availableCount} available
                                                </span>
                                                {blockedCount > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        {blockedCount} blocked
                                                    </span>
                                                )}
                                                {bookedCount > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        {bookedCount} booked
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                                            {ALL_HOURS.map((time) => {
                                                const key = `${date}_${time}`;
                                                const slot = slotMap.get(key);
                                                const isBooked = slot?.isBooked ?? false;
                                                const isBlocked = slot?.isBlocked ?? false;
                                                const isAvailable = !isBooked && !isBlocked;
                                                const isToggling = togglingSlot === key;

                                                return (
                                                    <button
                                                        key={key}
                                                        onClick={() => !isBooked && handleToggleSlot(date, time)}
                                                        disabled={isBooked || isToggling}
                                                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-1 ${isBooked
                                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-not-allowed"
                                                                : isBlocked
                                                                    ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 cursor-pointer"
                                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer"
                                                            }`}
                                                        title={
                                                            isBooked
                                                                ? "This slot has a booking"
                                                                : isBlocked
                                                                    ? "Click to make available"
                                                                    : "Click to block this slot"
                                                        }
                                                    >
                                                        {isToggling ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : isBlocked ? (
                                                            <Ban className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {time}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Legend */}
                            <div className="flex items-center gap-6 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800/50">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/20"></span>
                                    Available
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-red-500/10 border border-red-500/20"></span>
                                    Blocked by you
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/20"></span>
                                    Booked
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// --- Booking Card sub-component ---
interface BookingCardProps {
    booking: Booking;
    statusConfig: Record<string, { label: string; color: string; bg: string }>;
    onAccept?: () => void;
    onReject?: () => void;
    onCancel?: () => void;
    loading?: boolean;
    showActions: "respond" | "cancel" | "none";
}

function BookingCard({ booking, statusConfig, onAccept, onReject, onCancel, loading, showActions }: BookingCardProps) {
    const info = statusConfig[booking.status] || statusConfig.pending;
    return (
        <div
            className={`bg-gray-900/60 border rounded-2xl p-4 transition-colors ${booking.status === "pending" ? "border-amber-500/20" : "border-gray-800/50"
                }`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-white font-semibold">{booking.userName}</span>
                        {showActions === "none" && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${info.bg} ${info.color}`}>
                                {info.label}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {booking.timeSlot}
                        </span>
                    </div>
                    {booking.notes && (
                        <p className="mt-2 text-gray-500 text-sm bg-gray-800/30 rounded-lg p-2 border border-gray-800/50 truncate">
                            {booking.notes}
                        </p>
                    )}
                </div>

                {showActions === "respond" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={onAccept}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Accept
                        </button>
                        <button
                            onClick={onReject}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            Reject
                        </button>
                    </div>
                )}

                {showActions === "cancel" && (
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50 flex-shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
