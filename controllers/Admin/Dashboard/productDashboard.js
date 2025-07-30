import Product from "../../../models/Product.js";

export const productDashboard = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let activeProducts = 0;
    let inactiveProducts = 0;
    let deletedProducts = 0;
    let totalProducts = 0;

    result.forEach((item) => {
      const status = item._id;
      totalProducts += item.count;

      if (status === "deleted") {
        deletedProducts += item.count;
      } else if (status === "active") {
        activeProducts += item.count;
      } else if (status === "inactive") {
        inactiveProducts += item.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        deletedProducts,
      },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch product dashboard data",
    });
  }
};
