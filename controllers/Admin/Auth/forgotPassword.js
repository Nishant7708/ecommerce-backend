import Admin from "../../../models/Admin.js";
import crypto from "crypto";
import nodemailer from "nodemailer";


export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    email = email.toLowerCase();
    const admin = await Admin.findOne({ email });

    
    if (!admin) {
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, an OTP has been sent.",
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    admin.resetOTP = hashedOTP;
    admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await admin.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: admin.email,
      subject: "Your OTP for Password Reset",
      html: `
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Mail Error:", mailError);
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent successfully.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    return res.status(500).json({ message: "Failed to process request" });
  }
};
