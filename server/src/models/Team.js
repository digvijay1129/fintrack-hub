import mongoose from "mongoose";
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ["active", "archived"], default: "active", required: true }
}, { timestamps: true, versionKey: false });
teamSchema.index({ "members.user": 1, status: 1 });
export default mongoose.models.Team || mongoose.model("Team", teamSchema);
