import User from "../../../models/User.js";

export const userDashboard = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let activeUsers = 0;
    let inactiveUsers = 0;
    let deletedUsers = 0;
    let totalUsers = 0;

    result.forEach((item) => {
      totalUsers += item.count;
      if (item._id === "active") activeUsers = item.count;
      else if (item._id === "inactive") inactiveUsers = item.count;
      else if (item._id === "deleted") deletedUsers = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        deletedUsers,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch user dashboard data",
    });
  }
};
