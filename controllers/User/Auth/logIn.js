import User from "../../../models/User.js";
import Cart from "../../../models/Cart.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const Login = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || user.status === "deleted") {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "inactive") {
      return res
        .status(403)
        .json({ message: "Your account has been suspended." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: "user",
        profileImage: `${req.protocol}://${req.get("host")}${user.profileImage}`,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
      },
      process.env.JWT_USERSECRET,
      { expiresIn: "1000000y" }
    );

    const userCart = await Cart.findOne({ user: user._id }).populate({
      path: "products.productId",
      select: "name price",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      cart: userCart || {
        products: [],
        grandTotalPrice: 0,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
};
