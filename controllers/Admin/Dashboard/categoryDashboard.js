import Category from "../../../models/Category.js";

export const categoryDashboard = async (req, res) => {
  try {
    const result = await Category.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let activeCategories = 0;
    let inactiveCategories = 0;
    let deletedCategories = 0;
    let totalCategories = 0;

    result.forEach((item) => {
      totalCategories += item.count;
      if (item._id === "active") activeCategories = item.count;
      else if (item._id === "inactive") inactiveCategories = item.count;
      else if (item._id === "deleted") deletedCategories = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        deletedCategories,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch category dashboard data",
    });
  }
};
