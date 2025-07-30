import mongoose from "mongoose";
import Order from "../../../models/Order.js";

export const updateOrder = async (req, res) => {
  try {
    const { _id } = req.params;

    console.log("🔍 Received request to update order with ID:", _id);

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      console.warn("❌ Invalid order ID format:", _id);
      return res.status(400).json({ message: "Invalid order ID format." });
    }

    const allowedFields = ["status", "paymentMethod", "shippingAddress"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

   
    if (req.body.status === "delivered") {
      updates.deliveredAt = new Date();
    }

    updates.updatedAt = new Date(); 

    console.log("🛠️ Fields to update:", updates);

    const updatedOrder = await Order.findByIdAndUpdate(
      _id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("products._id", "name price");

    if (!updatedOrder) {
      console.warn("⚠️ No order found with ID:", _id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order updated successfully. Order ID:", updatedOrder._id);

    const formattedOrder = {
      _id: updatedOrder._id,
      orderId: updatedOrder.orderId,
      user: {
        name: updatedOrder.userId?.name || "N/A",
        email: updatedOrder.userId?.email || "N/A",
      },
      products: updatedOrder.products.map((item) => ({
        name: item._id?.name || "Deleted Product",
        price: item._id?.price || 0,
        quantity: item.quantity,
        total: item.price,
      })),
      totalPrice: updatedOrder.grandTotalPrice,
      status: updatedOrder.status,
      paymentMethod: updatedOrder.paymentMethod,
      shippingAddress: updatedOrder.shippingAddress,
      deliveredAt: updatedOrder.deliveredAt || null, 
      updatedAt: updatedOrder.updatedAt,
    };

    return res.status(200).json({
      message: "Order updated successfully",
      order: formattedOrder,
    });
  } catch (err) {
    console.error("💥 Error updating order:", err.message);
    return res
      .status(400)
      .json({ message: err.message || "Failed to update order" });
  }
};

// import mongoose from "mongoose";
// import Order from "../../../models/Order.js";

// export const updateOrder = async (req, res) => {
//   try {
//     const { _id } = req.params;

//     console.log("🔍 Received request to update order with ID:", _id);

//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       console.warn("❌ Invalid order ID format:", _id);
//       return res.status(400).json({ message: "Invalid order ID format." });
//     }

//     const allowedFields = ["status", "paymentMethod", "shippingAddress"];
//     const updates = {};

//     for (const field of allowedFields) {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     }

//     console.log("🛠️ Fields to update:", updates);

//     const updatedOrder = await Order.findByIdAndUpdate(
//       _id,
//       { $set: updates },
//       { new: true, runValidators: true }
//     )
//       .populate("userId", "name email")
//       .populate("products._id", "name price");

//     if (!updatedOrder) {
//       console.warn("⚠️ No order found with ID:", id);
//       return res.status(404).json({ message: "Order not found" });
//     }

//     console.log("✅ Order updated successfully. Order ID:", updatedOrder._id);

//     const formattedOrder = {
//       _id: updatedOrder._id,
//       orderId: updatedOrder.orderId,
//       user: {
//         name: updatedOrder.userId?.name || "N/A",
//         email: updatedOrder.userId?.email || "N/A",
//       },
//       products: updatedOrder.products.map((item) => ({
//         name: item._id?.name || "Deleted Product",
//         price: item._id?.price || 0,
//         quantity: item.quantity,
//         total: item.price,
//       })),
//       totalPrice: updatedOrder.grandTotalPrice,
//       status: updatedOrder.status,
//       paymentMethod: updatedOrder.paymentMethod,
//       shippingAddress: updatedOrder.shippingAddress,
//       updatedAt: updatedOrder.updatedAt,
//     };

//     return res.status(200).json({
//       message: "Order updated successfully",
//       order: formattedOrder,
//     });
//   } catch (err) {
//     console.error("💥 Error updating order:", err.message);
//     return res
//       .status(400)
//       .json({ message: err.message || "Failed to update order" });
//   }
// };
