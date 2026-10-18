import mongoose from "mongoose";
const invitationSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, select: false },
  status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled", "expired"], default: "pending", required: true },
  expiresAt: { type: Date, required: true, index: true },
  respondedAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
invitationSchema.index({ email: 1, status: 1, expiresAt: 1 });
export default mongoose.models.TeamInvitation || mongoose.model("TeamInvitation", invitationSchema);
