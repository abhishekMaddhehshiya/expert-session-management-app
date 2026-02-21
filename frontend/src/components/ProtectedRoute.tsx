import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: "user" | "expert";
    denyRole?: "user" | "expert";
}

export default function ProtectedRoute({ children, requiredRole, denyRole }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // Deny specific roles (redirect experts to dashboard)
    if (denyRole && user?.role === denyRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
