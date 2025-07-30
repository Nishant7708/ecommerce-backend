import User from "../../../models/User.js";
import bcrypt from "bcryptjs";

export const addUser = async (req, res) => {
  try {
    let { name, email, password, dob, gender } = req.body;

    if (!name || !email || !password || !dob || !gender) {
      return res.status(400).json({
        message: "Name, email, password, dob, and gender are required.",
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
            createdAt: existingUser.createdAt,
          },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dob: dobDate,
      gender,
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
