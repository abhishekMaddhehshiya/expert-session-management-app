import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/db.ts";
import { initSocket } from "./socket.ts";
import expertRoutes from "./routes/expertRoutes.ts";
import bookingRoutes from "./routes/bookingRoutes.ts";
import authRoutes from "./routes/authRoutes.ts";
import notificationRoutes from "./routes/notificationRoutes.ts";

dotenv.config();

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

app.get("/", (_req, res) => {
  res.json({ message: "Expert Session Booking API is running" });
});

// Start server
const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});