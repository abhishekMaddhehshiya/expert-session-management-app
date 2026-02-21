import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    FileText,
    CalendarDays,
    Clock,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import {
    fetchExpertById,
    createBooking,
    type Expert,
    type TimeSlot,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface FormData {
    date: string;
    timeSlot: string;
    notes: string;
}

interface FormErrors {
    date?: string;
    timeSlot?: string;
}

export default function BookingPage() {
    const { expertId } = useParams<{ expertId: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [expert, setExpert] = useState<Expert | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [form, setForm] = useState<FormData>({
        date: searchParams.get("date") || "",
        timeSlot: searchParams.get("slot") || "",
        notes: "",
    });

    useEffect(() => {
        if (!expertId) return;
        fetchExpertById(expertId)
            .then(setExpert)
            .catch(() => toast.error("Failed to load expert"))
            .finally(() => setLoading(false));
    }, [expertId]);

    // Group available (unbooked) slots by date
    const slotsByDate: Record<string, TimeSlot[]> = {};
    if (expert) {
        expert.availableSlots
            .filter((s) => !s.isBooked)
            .forEach((slot) => {
                if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
                slotsByDate[slot.date]!.push(slot);
            });
    }
    const availableDates = Object.keys(slotsByDate).sort();
    const availableSlotsForDate = form.date ? slotsByDate[form.date] || [] : [];

    const validate = (): boolean => {
        const errs: FormErrors = {};
        if (!form.date) errs.date = "Please select a date";
        if (!form.timeSlot) errs.timeSlot = "Please select a time slot";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !expertId) return;

        setSubmitting(true);
        try {
            await createBooking({
                expertId,
                date: form.date,
                timeSlot: form.timeSlot,
                notes: form.notes,
            });
            setSuccess(true);
            toast.success("Booking request submitted!");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to create booking"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
        // Reset time slot when date changes
        if (field === "date") {
            setForm((prev) => ({ ...prev, date: value, timeSlot: "" }));
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading booking form...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20">
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                        <CheckCircle2 className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Booking Request Sent!
                    </h2>
                    <p className="text-gray-400 mb-2">
                        Your session request with{" "}
                        <span className="text-violet-400 font-medium">
                            {expert?.name}
                        </span>{" "}
                        on{" "}
                        <span className="text-white font-medium">
                            {form.date}
                        </span>{" "}
                        at{" "}
                        <span className="text-white font-medium">
                            {form.timeSlot}
                        </span>{" "}
                        has been submitted.
                    </p>
                    <p className="text-amber-400/80 text-sm mb-6">
                        ⏳ Awaiting expert approval. You&apos;ll receive a real-time notification
                        when the expert responds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/my-bookings"
                            className="px-5 py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors shadow-lg shadow-violet-500/25"
                        >
                            View My Bookings
                        </Link>
                        <Link
                            to="/"
                            className="px-5 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
                        >
                            Browse Experts
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back */}
            <Link
                to={expertId ? `/expert/${expertId}` : "/"}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Expert
            </Link>

            {/* Expert Mini Card */}
            {expert && (
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 mb-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                        {expert.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{expert.name}</h3>
                        <p className="text-gray-400 text-sm">{expert.category}</p>
                    </div>
                </div>
            )}

            {/* Booking info - logged in user */}
            {user && (
                <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-400">
                        Booking as{" "}
                        <span className="text-white font-medium">{user.name}</span>{" "}
                        ({user.email})
                    </p>
                </div>
            )}

            {/* Booking Form */}
            <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-white mb-6">
                    Book a Session
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <CalendarDays className="w-4 h-4 text-gray-500" />
                            Date
                        </label>
                        <select
                            value={form.date}
                            onChange={(e) => updateField("date", e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-gray-200 focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer ${errors.date
                                ? "border-red-500/50 focus:ring-red-500/40"
                                : "border-gray-700/50 focus:ring-violet-500/40 focus:border-violet-500/40"
                                }`}
                        >
                            <option value="">Select a date</option>
                            {availableDates.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                        {errors.date && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.date}
                            </p>
                        )}
                    </div>

                    {/* Time Slot */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            Time Slot
                        </label>
                        {form.date ? (
                            availableSlotsForDate.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableSlotsForDate.map((slot) => (
                                        <button
                                            key={slot.time}
                                            type="button"
                                            onClick={() => updateField("timeSlot", slot.time)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${form.timeSlot === slot.time
                                                ? "bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/25"
                                                : "bg-gray-800/50 text-gray-300 border-gray-700/50 hover:border-violet-500/40 hover:text-violet-400"
                                                }`}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No available slots for this date
                                </p>
                            )
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Please select a date first
                            </p>
                        )}
                        {errors.timeSlot && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {errors.timeSlot}
                            </p>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            Notes (Optional)
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => updateField("notes", e.target.value)}
                            placeholder="Any specific topics or questions you'd like to discuss..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Request Booking"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
