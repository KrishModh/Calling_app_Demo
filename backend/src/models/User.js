import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    socketId: { type: String, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
