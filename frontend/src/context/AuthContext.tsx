import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getMeApi, loginApi, signupApi, type User } from "../lib/api";
import { joinRoom } from "../lib/socket";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: {
        name: string;
        email: string;
        password: string;
        role: "user" | "expert";
        phone?: string;
        category?: string;
        bio?: string;
        experience?: number;
    }) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            getMeApi()
                .then((userData) => {
                    setUser(userData);
                    joinRoom(userData._id);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const result = await loginApi({ email, password });
        localStorage.setItem("token", result.token);
        setUser(result.user);
        joinRoom(result.user._id);
    };

    const signup = async (data: {
        name: string;
        email: string;
        password: string;
        role: "user" | "expert";
        phone?: string;
        category?: string;
        bio?: string;
        experience?: number;
    }) => {
        const result = await signupApi(data);
        localStorage.setItem("token", result.token);
        setUser(result.user);
        joinRoom(result.user._id);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
