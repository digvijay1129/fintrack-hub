import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ["User", "Admin"], default: "User", required: true },
  status: { type: String, enum: ["active", "inactive"], default: "active", required: true },
  preferredCurrency: { type: String, enum: ["INR", "USD", "EUR", "GBP", "CAD", "AUD"], default: "INR" },
  timezone: { type: String, default: "Asia/Kolkata", maxlength: 80 },
  lastLoginAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
userSchema.index({ email: 1 }, { unique: true });
export default mongoose.models.User || mongoose.model("User", userSchema);
