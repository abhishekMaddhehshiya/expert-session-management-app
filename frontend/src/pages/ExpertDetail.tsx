import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Star,
    Briefcase,
    ArrowLeft,
    Clock,
    CalendarDays,
    Loader2,
    AlertCircle,
    Zap,
    Mail,
    Phone,
} from "lucide-react";
import { fetchExpertById, type Expert, type TimeSlot } from "../lib/api";
import socket from "../lib/socket";

export default function ExpertDetail() {
    const { id } = useParams<{ id: string }>();
    const [expert, setExpert] = useState<Expert | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError("");
        fetchExpertById(id)
            .then(setExpert)
            .catch(() => setError("Failed to load expert details"))
            .finally(() => setLoading(false));
    }, [id]);

    // Real-time slot update via Socket.io
    useEffect(() => {
        const handleSlotBooked = (data: {
            expertId: string;
            date: string;
            timeSlot: string;
        }) => {
            if (data.expertId === id) {
                setExpert((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        availableSlots: prev.availableSlots.map((slot) =>
                            slot.date === data.date && slot.time === data.timeSlot
                                ? { ...slot, isBooked: true }
                                : slot
                        ),
                    };
                });
            }
        };

        socket.on("slotBooked", handleSlotBooked);
        return () => {
            socket.off("slotBooked", handleSlotBooked);
        };
    }, [id]);

    // Group slots by date
    const slotsByDate: Record<string, TimeSlot[]> = {};
    if (expert) {
        expert.availableSlots.forEach((slot) => {
            if (!slotsByDate[slot.date]) {
                slotsByDate[slot.date] = [];
            }
            slotsByDate[slot.date]!.push(slot);
        });
        // Sort slots within each date by time
        Object.values(slotsByDate).forEach((slots) =>
            slots.sort((a, b) => a.time.localeCompare(b.time))
        );
    }

    const sortedDates = Object.keys(slotsByDate).sort();

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.getTime() === today.getTime()) return "Today";
        if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading expert details...</p>
            </div>
        );
    }

    if (error || !expert) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-400 font-medium mb-4">
                    {error || "Expert not found"}
                </p>
                <Link
                    to="/"
                    className="text-violet-400 hover:text-violet-300 underline text-sm"
                >
                    Back to experts
                </Link>
            </div>
        );
    }

    const categoryColors: Record<string, string> = {
        Technology: "from-blue-500 to-cyan-500",
        Business: "from-amber-500 to-orange-500",
        Health: "from-emerald-500 to-green-500",
        Design: "from-pink-500 to-rose-500",
        Finance: "from-violet-500 to-purple-500",
        Education: "from-teal-500 to-sky-500",
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Experts
            </Link>

            {/* Expert Profile Card */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div
                        className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${categoryColors[expert.category] || "from-gray-500 to-gray-600"
                            } flex items-center justify-center text-white text-3xl font-bold shadow-xl flex-shrink-0`}
                    >
                        {expert.name.charAt(0)}
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-white">{expert.name}</h1>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 border border-gray-700/50">
                                {expert.category}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                <Briefcase className="w-4 h-4" />
                                {expert.experience} years
                            </div>
                            <div className="flex items-center gap-1.5 text-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-amber-400 font-semibold">
                                    {expert.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            {expert.email && (
                                <a
                                    href={`mailto:${expert.email}`}
                                    className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    {expert.email}
                                </a>
                            )}
                            {expert.phone && (
                                <a
                                    href={`tel:${expert.phone}`}
                                    className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                                >
                                    <Phone className="w-4 h-4" />
                                    {expert.phone}
                                </a>
                            )}
                        </div>

                        <p className="text-gray-400 leading-relaxed">{expert.bio}</p>
                    </div>
                </div>
            </div>

            {/* Real-time indicator */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-medium">
                        Live Updates
                    </span>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                </div>
                <span className="text-gray-500 text-sm">
                    — Slots update in real-time when booked
                </span>
            </div>

            {/* Available Slots */}
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-400" />
                Available Time Slots
            </h2>

            {sortedDates.length === 0 ? (
                <div className="text-center py-12 bg-gray-900/40 rounded-2xl border border-gray-800/50">
                    <Clock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No available slots</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {sortedDates.map((date) => (
                        <div key={date} className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                                <CalendarDays className="w-4 h-4 text-violet-400" />
                                {formatDate(date)}
                                <span className="text-gray-500 font-normal">({date})</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {slotsByDate[date]!.map((slot) => (
                                    <div key={`${date}-${slot.time}`}>
                                        {slot.isBooked ? (
                                            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-800/50 text-gray-600 text-sm cursor-not-allowed line-through border border-gray-700/30">
                                                <Clock className="w-3.5 h-3.5" />
                                                {slot.time}
                                            </span>
                                        ) : (
                                            <Link
                                                to={`/booking/${expert._id}?date=${date}&slot=${encodeURIComponent(slot.time)}`}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500/10 text-violet-400 text-sm font-medium border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
                                            >
                                                <Clock className="w-3.5 h-3.5" />
                                                {slot.time}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
