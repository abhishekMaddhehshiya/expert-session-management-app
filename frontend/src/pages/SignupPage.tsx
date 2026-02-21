import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    UserPlus,
    Mail,
    Lock,
    User,
    Phone,
    Briefcase,
    FileText,
    Loader2,
    AlertCircle,
    GraduationCap,
    Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const categories = [
    "Technology",
    "Business",
    "Health",
    "Design",
    "Finance",
    "Education",
];

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "" as "user" | "expert" | "",
        category: "",
        bio: "",
        experience: "",
    });

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password || !form.role) return;

        if (form.role === "expert" && !form.category) {
            setError("Please select a category for your expertise");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await signup({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role as "user" | "expert",
                phone: form.phone.trim(),
                category: form.category,
                bio: form.bio.trim(),
                experience: form.experience ? parseInt(form.experience) : undefined,
            });
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/20">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-gray-400">
                        Join{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent font-medium">
                            ExpertBook
                        </span>{" "}
                        as an expert or user
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 sm:p-8">
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-5">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-3 block">
                                I want to join as
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => updateField("role", "user")}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.role === "user"
                                            ? "border-violet-500 bg-violet-500/10 text-violet-400"
                                            : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                                        }`}
                                >
                                    <Users className="w-6 h-6" />
                                    <span className="text-sm font-medium">User</span>
                                    <span className="text-xs text-gray-500">Book sessions</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => updateField("role", "expert")}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.role === "expert"
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                            : "border-gray-700/50 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                                        }`}
                                >
                                    <GraduationCap className="w-6 h-6" />
                                    <span className="text-sm font-medium">Expert</span>
                                    <span className="text-xs text-gray-500">Offer sessions</span>
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <User className="w-4 h-4 text-gray-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => updateField("name", e.target.value)}
                                placeholder="Enter your full name"
                                required
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <Mail className="w-4 h-4 text-gray-500" />
                                Email
                            </label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <Lock className="w-4 h-4 text-gray-500" />
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => updateField("password", e.target.value)}
                                placeholder="Min 6 characters"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                Phone (Optional)
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                            />
                        </div>

                        {/* Expert-specific fields */}
                        {form.role === "expert" && (
                            <>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        Category
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => updateField("category", e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Select your expertise</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Briefcase className="w-4 h-4 text-gray-500" />
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        value={form.experience}
                                        onChange={(e) => updateField("experience", e.target.value)}
                                        placeholder="e.g., 5"
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        Bio
                                    </label>
                                    <textarea
                                        value={form.bio}
                                        onChange={(e) => updateField("bio", e.target.value)}
                                        placeholder="Tell users about your expertise..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all resize-none"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !form.role}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold hover:from-violet-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
