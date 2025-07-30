import User from "../../../models/User.js";

export const updateUser = async (req, res) => {
  try {
    const { role } = req.user;
    const { _id, name, email, status, dob,gender } = req.body;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    if (!_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {};

    if (name) updateData.name = name;

    if (dob) updateData.dob = dob;

    if (gender) updateData.gender = gender;

    if (typeof status === "string" && ["active", "inactive"].includes(status)) {
      if (user.status === "deleted") {
        return res.status(400).json({ message: "Cannot update status of a deleted user." });
      }
      if (user.status !== status) {
        updateData.status = status;
      }
    }

    if (email) {
      if (typeof email !== "string" || !email.includes("@gmail.com")) {
        return res.status(400).json({ message: "Invalid email format." });
      }
      updateData.email = email;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(_id, updateData, {
      new: true,
      select: "-password -resetOTP -otpExpires",
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        userId: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        status: updatedUser.status,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error.message);
    return res.status(500).json({ message: "Failed to update user" });
  }
};
