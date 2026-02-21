import { Link, useLocation, useNavigate } from "react-router-dom";
import { Calendar, Users, LogIn, UserPlus, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Experts go to dashboard, others go to home
    const logoDestination = isAuthenticated && user?.role === "expert" ? "/dashboard" : "/";

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gray-950/80 border-b border-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to={logoDestination} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            ExpertBook
                        </span>
                    </Link>

                    <div className="flex items-center gap-1">
                        {isAuthenticated && user?.role !== "expert" && (
                            <Link
                                to="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/")
                                    ? "bg-violet-500/15 text-violet-400"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                    }`}
                            >
                                <Users className="w-4 h-4" />
                                Experts
                            </Link>
                        )}

                        {isAuthenticated && user?.role !== "expert" && (
                            <Link
                                to="/my-bookings"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/my-bookings")
                                    ? "bg-violet-500/15 text-violet-400"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                My Bookings
                            </Link>
                        )}

                        {isAuthenticated && user?.role === "expert" && (
                            <Link
                                to="/dashboard"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/dashboard")
                                    ? "bg-violet-500/15 text-violet-400"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                    }`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Dashboard
                            </Link>
                        )}

                        {isAuthenticated && (
                            <>
                                <NotificationBell />
                                <div className="flex items-center gap-2 pl-2 ml-2 border-l border-gray-800/50">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800/30">
                                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm text-gray-300 hidden sm:inline">
                                            {user?.name}
                                        </span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${user?.role === "expert"
                                            ? "bg-emerald-500/15 text-emerald-400"
                                            : "bg-violet-500/15 text-violet-400"
                                            }`}>
                                            {user?.role?.toUpperCase()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {!isAuthenticated && (
                            <div className="flex items-center gap-1 pl-2 ml-2 border-l border-gray-800/50">
                                <Link
                                    to="/login"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive("/login")
                                        ? "bg-violet-500/15 text-violet-400"
                                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                                        }`}
                                >
                                    <LogIn className="w-4 h-4" />
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md shadow-violet-500/20"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
