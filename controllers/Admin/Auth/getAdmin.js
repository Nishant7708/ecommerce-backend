import Admin from "../../../models/Admin.js";

export const getAdmin = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins only" });
    }

    const admin = await Admin.findById(_id, "-password -resetOTP -otpExpires");

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    return res.status(200).json({
      success: true,
      admin: {
        adminId: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Get Admin Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch admin" });
  }
};
