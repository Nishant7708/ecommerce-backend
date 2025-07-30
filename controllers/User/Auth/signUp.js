import User from "../../../models/User.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

export const Signup = async (req, res) => {
  try {
    let { name, email, password, dob, gender, phone } = req.body;

    if (!name || !email || !password ) {
      return res.status(400).json({
        message: "Name, email, passwordare required.",
      });
    }

    let dobDate;
    if (dob.includes("/")) {
      const [month, day, year] = dob.split("/");
      dobDate = new Date(Date.UTC(year, month - 1, day));
    } else {
      dobDate = new Date(dob);
      dobDate.setUTCHours(0, 0, 0, 0);
    }

    // 🖼️ File upload required
    if (!req.files || !req.files.profileImage) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    const image = req.files.profileImage;

    // 🧪 Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(image.mimetype)) {
      return res.status(400).json({ message: "Invalid image type." });
    }

    // 📁 Upload path
    const uploadDir = path.resolve("uploads/profile");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${Date.now()}_${image.name}`;
    const imagePath = path.join(uploadDir, filename);
    await image.mv(imagePath);
    const profileImagePath = `/uploads/profile/${filename}`;

    // 🔎 Check for existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(409).json({ message: "User already exists." });
      }

      if (existingUser.status === "deleted") {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.status = "active";
        existingUser.dob = dobDate;
        existingUser.gender = gender;
        existingUser.phone = phone;
        existingUser.profileImage = profileImagePath;

        await existingUser.save();

        return res.status(200).json({
          success: true,
          message: "User account has been reactivated.",
          User: {
            _id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email,
            dob: existingUser.dob.toISOString().split("T")[0],
            gender: existingUser.gender,
            phone: existingUser.phone,
            profileImage: existingUser.profileImage,
            createdAt: existingUser.createdAt,
          },
        });
      }
    }

    // 🔐 Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dob: dobDate,
      gender,
      phone,
      profileImage: profileImagePath,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      User: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        dob: newUser.dob.toISOString().split("T")[0],
        gender: newUser.gender,
        phone: newUser.phone,
        profileImage: newUser.profileImage,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("User Creation Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong." });
  }
};