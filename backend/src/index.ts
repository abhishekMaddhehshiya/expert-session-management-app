import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.ts";
import { initSocket } from "./socket.ts";
import expertRoutes from "./routes/expertRoutes.ts";
import bookingRoutes from "./routes/bookingRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import notificationRoutes from "./routes/notificationRoutes.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/experts", expertRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve frontend static files in production
const frontendDistPath = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDistPath));

// Handle client-side routing - serve index.html for all non-API routes
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

// Start server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});