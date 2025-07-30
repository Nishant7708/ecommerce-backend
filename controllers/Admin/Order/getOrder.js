import Order from "../../../models/Order.js";
import mongoose from "mongoose";

export const getAllOrders = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const { page = 1, limit = 10, search = "{}" } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filters = {};
    try {
      const parsed = JSON.parse(search);
      if (parsed.orderId && !isNaN(parsed.orderId)) {
        filters.orderId = parseInt(parsed.orderId);
      }
      if (parsed.status) {
        filters.status = parsed.status;
      }
      if (parsed.paymentMethod) {
        filters.paymentMethod = parsed.paymentMethod;
      }
    } catch (e) {
      return res.status(400).json({ message: "Invalid search format" });
    }

    const total = await Order.countDocuments(filters);

    const orders = await Order.find(filters)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("products._id", "name price imageUrl");

    const formatted = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      user: {
        name: order.userId?.name,
        email: order.userId?.email,
      },
      products: order.products.map((p) => ({
        name: p._id?.name,
        image: p._id?.imageUrl,
        price: p._id?.price,
        quantity: p.quantity,
        total: p.price * p.quantity,
      })),
      totalPrice: order.grandTotalPrice,
      status: order.status,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      orderedAt: order.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      data: formatted,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const requestingUserId = req.user._id.toString();

    // If admin, use :userId from params, else use logged-in user's ID
    const targetUserId = isAdmin ? req.params.userId : requestingUserId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Prevent regular users from accessing other users' orders
    if (!isAdmin && targetUserId !== requestingUserId) {
      return res.status(403).json({
        message: "Unauthorized: cannot access other users' orders",
      });
    }

    // Parse filters from query string
    const { page = 1, limit = 10, orderId, status, paymentMethod } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      userId: targetUserId,
    };

    if (orderId) filter.orderId = Number(orderId);
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("products._id", "name price imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      products: order.products.map((p) => ({
        name: p._id?.name,
        image: p._id?.imageUrl,
        price: p._id?.price,
        quantity: p.quantity,
        total: p.price * p.quantity,
      })),
      totalPrice: order.grandTotalPrice,
      status: order.status || "pending",
      paymentMethod: order.paymentMethod || "Not selected",
      shippingAddress: order.shippingAddress,
      orderedAt: order.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: formattedOrders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};
