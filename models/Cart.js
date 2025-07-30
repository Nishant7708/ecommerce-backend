import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        _id: false,
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
        totalPrice: { type: Number }
      },
    ],
    grandTotalPrice: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
