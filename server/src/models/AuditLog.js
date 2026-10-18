import mongoose from "mongoose";
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true, trim: true, maxlength: 80 },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  requestId: { type: String, maxlength: 100, default: null }
}, { timestamps: { createdAt: true, updatedAt: false }, versionKey: false });
auditLogSchema.index({ createdAt: -1 });
export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);
