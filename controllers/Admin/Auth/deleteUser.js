import User from "../../../models/User.js";

export const deleteUser = async (req, res) => {
  try {
    const { _id } = req.params;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status === "deleted") {
      return res.status(201).json({ message: "User already deleted" });
    }

    user.status = "deleted";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User marked as deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
