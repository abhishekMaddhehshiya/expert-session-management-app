import { Link } from "react-router-dom";
import {
    Calendar,
    Users,
    Clock,
    Star,
    CheckCircle2,
    ArrowRight,
    Zap,
    Shield,
    MessageSquare,
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-violet-500/20 rounded-full blur-3xl opacity-20" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
                    <div className="text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-8">
                            <Zap className="w-4 h-4 text-violet-400" />
                            <span className="text-sm text-violet-400 font-medium">
                                Real-time booking platform
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Book Sessions with{" "}
                            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                Top Experts
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                            Connect with industry professionals across Technology, Business, Health,
                            Design, Finance, and Education. Schedule your session in minutes.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:from-violet-600 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                            >
                                Get Started Free
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-800/50 text-gray-200 font-semibold text-lg border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-16 pt-16 border-t border-gray-800/50">
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">50+</div>
                                <div className="text-gray-500 text-sm">Expert Professionals</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">6</div>
                                <div className="text-gray-500 text-sm">Categories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">24/7</div>
                                <div className="text-gray-500 text-sm">Available Slots</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">4.8</div>
                                <div className="text-gray-500 text-sm">Average Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Why Choose ExpertBook?
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            A seamless platform designed to connect you with the right experts
                            at the right time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-violet-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Verified Experts
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                All experts are verified professionals with years of experience in their fields.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                <Clock className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Real-time Availability
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                See available time slots instantly with live updates as bookings happen.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Easy Scheduling
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Book sessions in just a few clicks. Manage all your bookings in one place.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                                <MessageSquare className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Instant Notifications
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Get real-time notifications when experts accept or respond to your bookings.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-4">
                                <Star className="w-6 h-6 text-pink-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Ratings & Reviews
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Choose experts based on ratings and reviews from other users.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-6 hover:border-violet-500/30 transition-all">
                            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-teal-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Secure Platform
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Your data is protected with industry-standard security measures.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            Explore Categories
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Find experts across various domains to help you achieve your goals.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { name: "Technology", color: "from-blue-500 to-cyan-500", icon: "💻" },
                            { name: "Business", color: "from-amber-500 to-orange-500", icon: "📊" },
                            { name: "Health", color: "from-emerald-500 to-green-500", icon: "🏥" },
                            { name: "Design", color: "from-pink-500 to-rose-500", icon: "🎨" },
                            { name: "Finance", color: "from-violet-500 to-purple-500", icon: "💰" },
                            { name: "Education", color: "from-teal-500 to-sky-500", icon: "📚" },
                        ].map((category) => (
                            <div
                                key={category.name}
                                className="bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 text-center hover:border-violet-500/30 hover:bg-gray-900/80 transition-all cursor-pointer group"
                            >
                                <div className="text-3xl mb-3">{category.icon}</div>
                                <div className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    {category.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-gray-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-400 max-w-xl mx-auto">
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
                                <span className="text-2xl font-bold text-violet-400">1</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Browse Experts
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Search and filter experts by category, rating, or experience level.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
                                <span className="text-2xl font-bold text-violet-400">2</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Book a Slot
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Choose an available time slot and submit your booking request.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
                                <span className="text-2xl font-bold text-violet-400">3</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">
                                Get Confirmed
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Receive instant notification when your session is confirmed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-3xl p-8 sm:p-12 text-center">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md mx-auto">
                            Join thousands of users who are already connecting with top experts.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/25"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Create Free Account
                            </Link>
                            <Link
                                to="/login"
                                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-800/50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                                ExpertBook
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            © 2026 ExpertBook. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
