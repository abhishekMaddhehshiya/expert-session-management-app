import mongoose, { Schema, type Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: "booking_request" | "booking_accepted" | "booking_rejected" | "booking_cancelled";
    message: string;
    bookingId: mongoose.Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        type: {
            type: String,
            enum: ["booking_request", "booking_accepted", "booking_rejected", "booking_cancelled"],
            required: true,
        },
        message: { type: String, required: true },
        bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
