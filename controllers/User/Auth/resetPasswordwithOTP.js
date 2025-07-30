import User from "../../../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOTP || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP is expired or invalid" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== user.resetOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};
