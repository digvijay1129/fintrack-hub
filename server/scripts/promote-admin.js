import User from "../src/models/User.js";
import { connectToDatabase } from "../src/config/database.js";
import mongoose from "mongoose";

const email = process.env.ADMIN_EMAIL_TO_PROMOTE?.trim().toLowerCase();
if (process.env.CONFIRM_PROMOTE_ADMIN !== "true" || !email) {
  console.error("Refusing to change roles. Set ADMIN_EMAIL_TO_PROMOTE and CONFIRM_PROMOTE_ADMIN=true, then run from the server directory.");
  process.exitCode = 1;
} else {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) throw new Error("No registered account found for ADMIN_EMAIL_TO_PROMOTE.");
    user.role = "Admin";
    await user.save();
    console.info("Administrator role assigned to:", user.email);
  } catch (error) {
    console.error("Admin bootstrap failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
