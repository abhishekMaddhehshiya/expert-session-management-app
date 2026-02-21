import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Not authorized, no token" });
        return;
    }

    const token = authHeader.split(" ")[1]!;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key_change_me") as {
            userId: string;
            role: string;
        };
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

export const expertOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== "expert") {
        res.status(403).json({ message: "Access denied. Expert only." });
        return;
    }
    next();
};
