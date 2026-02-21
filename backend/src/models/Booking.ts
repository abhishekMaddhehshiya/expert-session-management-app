import mongoose, { Schema, type Document } from "mongoose";

export interface IBooking extends Document {
    expertId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    expertName: string;
    userName: string;
    email: string;
    phone: string;
    date: string;
    timeSlot: string;
    notes: string;
    status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        expertId: {
            type: Schema.Types.ObjectId,
            ref: "Expert",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        expertName: { type: String, required: true },
        userName: { type: String, required: true },
        email: { type: String, required: true, index: true },
        phone: { type: String, default: "" },
        date: { type: String, required: true },
        timeSlot: { type: String, required: true },
        notes: { type: String, default: "" },
        status: {
            type: String,
            enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Compound unique index to prevent double booking - only for active bookings (pending/confirmed)
bookingSchema.index(
    { expertId: 1, date: 1, timeSlot: 1 },
    { 
        unique: true,
        partialFilterExpression: { status: { $in: ["pending", "confirmed"] } }
    }
);

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);
export default Booking;
