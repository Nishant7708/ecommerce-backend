import Order from "../../../models/Order.js";

export const orderDashboard = async (req, res) => {
  try {
    const result = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let totalOrders = 0;

    result.forEach((item) => {
      totalOrders += item.count;
      if (item._id === "pending") pendingOrders = item.count;
      else if (item._id === "processing") processingOrders = item.count;
      else if (item._id === "shipped") shippedOrders = item.count;
      else if (item._id === "delivered") deliveredOrders = item.count;
      else if (item._id === "cancelled") cancelledOrders = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
      },
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Cannot fetch order dashboard data",
    });
  }
};
