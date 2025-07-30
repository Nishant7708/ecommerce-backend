import Admin from "../../../models/Admin.js";

export const updateAdmin = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const { email, ...otherUpdates } = req.body;
    const updateData = { ...otherUpdates };

    if (email) {
      if (typeof email !== "string" || !email.endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Invalid email format. Only Gmail addresses are allowed." });
      }
      updateData.email = email;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, select: "-password -resetOTP -otpExpires" }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      admin: {
        name: updatedAdmin.name,
        email: updatedAdmin.email,
      },
    });
  } catch (error) {
    console.error("Update Admin Error:", error.message);
    return res.status(500).json({ message: "Failed to update admin" });
  }
};
