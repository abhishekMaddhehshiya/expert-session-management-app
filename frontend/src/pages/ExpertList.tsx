import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Star, Briefcase, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { fetchExperts, fetchCategories, type Expert, type PaginationInfo } from "../lib/api";

export default function ExpertList() {
    const [experts, setExperts] = useState<Expert[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await fetchExperts(page, 8, search, category);
                setExperts(data.experts);
                setPagination(data.pagination);
            } catch {
                setError("Failed to load experts. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, search, category]);

    // Debounced search
    const [searchInput, setSearchInput] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleCategoryChange = (cat: string) => {
        setCategory(cat);
        setPage(1);
    };

    const categoryColors: Record<string, string> = {
        Technology: "from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30",
        Business: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
        Health: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30",
        Design: "from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30",
        Finance: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30",
        Education: "from-teal-500/20 to-sky-500/20 text-teal-400 border-teal-500/30",
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Find Your <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Expert</span>
                </h1>
                <p className="text-gray-400">
                    Browse and book sessions with top professionals across categories
                </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search experts by name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="pl-10 pr-8 py-3 bg-gray-900/80 border border-gray-700/50 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer min-w-[180px]"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                    <p className="text-gray-400">Loading experts...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <p className="text-red-400 font-medium mb-2">{error}</p>
                    <button
                        onClick={() => setPage(page)}
                        className="text-sm text-violet-400 hover:text-violet-300 underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Expert Grid */}
            {!loading && !error && (
                <>
                    {experts.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No experts found</p>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {experts.map((expert) => (
                                <Link
                                    to={`/expert/${expert._id}`}
                                    key={expert._id}
                                    className="group relative bg-gray-900/60 border border-gray-800/50 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-gray-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5"
                                >
                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="relative">
                                        {/* Avatar + Category */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                                                {expert.name.charAt(0)}
                                            </div>
                                            <span
                                                className={`text-xs font-medium px-2.5 py-1 rounded-lg border bg-gradient-to-r ${categoryColors[expert.category] ||
                                                    "from-gray-500/20 to-gray-500/20 text-gray-400 border-gray-500/30"
                                                    }`}
                                            >
                                                {expert.category}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                                            {expert.name}
                                        </h3>

                                        {/* Experience */}
                                        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            <span>{expert.experience} years experience</span>
                                        </div>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="text-amber-400 font-semibold text-sm">
                                                {expert.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-10">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-900/80 border border-gray-700/50 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${p === page
                                                ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                                                : "text-gray-400 hover:bg-gray-800"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!pagination.hasMore}
                                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-900/80 border border-gray-700/50 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
