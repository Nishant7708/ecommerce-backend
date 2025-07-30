import Admin from "../../../models/Admin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";


export const resetPasswordWithOTP = async (req, res) => {
  try {
    let { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    email = email.toLowerCase();
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (!admin.resetOTP || !admin.otpExpires || admin.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP is expired or invalid" });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedOTP !== admin.resetOTP) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    admin.password = hashedPassword;
    admin.resetOTP = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};