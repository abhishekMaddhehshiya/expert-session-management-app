import mongoose, { Schema, type Document } from "mongoose";

export interface IBlockedSlot {
  date: string;
  time: string;
}

export interface IExpert extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  experience: number;
  rating: number;
  bio: string;
  profileImage: string;
  blockedSlots: IBlockedSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const blockedSlotSchema = new Schema<IBlockedSlot>({
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const expertSchema = new Schema<IExpert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    experience: { type: Number, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    bio: { type: String, required: true },
    profileImage: { type: String, default: "" },
    blockedSlots: [blockedSlotSchema],
  },
  { timestamps: true }
);

const Expert = mongoose.model<IExpert>("Expert", expertSchema);
export default Expert;
