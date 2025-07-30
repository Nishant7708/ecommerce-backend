import Product from "../../../models/Product.js";
import Cart from "../../../models/Cart.js";
import mongoose from "mongoose";

export const deleteCartProduct = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid Product ID." });
  }

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    const initialLength = cart.products.length;
    const updatedProducts = cart.products.filter(
      (p) => !p.productId.equals(productId)
    );

    if (updatedProducts.length === initialLength) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    if (updatedProducts.length === 0) {
      const clearedCart = await Cart.findOneAndUpdate(
        { user: userId },
        { products: [], grandTotalPrice: 0 },
        { new: true }
      );

      return res.status(200).json({
        message: "Product removed. Cart is now empty.",
        cart: {
          _id: clearedCart._id,
          user: clearedCart.user,
          products: [],
          grandTotalPrice: 0,
        },
      });
    }

    // Recalculate totalPrice per product
    const productsData = await Product.find({
      _id: { $in: updatedProducts.map((item) => item.productId) },
    });

    const productMap = productsData.reduce((acc, prod) => {
      acc[prod._id.toString()] = prod.price;
      return acc;
    }, {});

    const recalculatedProducts = updatedProducts.map((item) => {
      const price = productMap[item.productId.toString()] || 0;
      return {
        ...item.toObject(),
        totalPrice: Number((price * item.quantity).toFixed(2)),
      };
    });

    const grandTotal = recalculatedProducts.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      {
        products: recalculatedProducts,
        grandTotalPrice: Number(grandTotal.toFixed(2)),
      },
      { new: true }
    )
      .populate("products.productId", "name price imageUrl")
      .lean();

    res.status(200).json({
      message: "Product removed from cart",
      cart: {
        _id: updatedCart._id,
        user: updatedCart.user,
        products: updatedCart.products.map((item) => ({
          productId: {
            _id: item.productId._id,
            name: item.productId.name,
            price: Number(item.productId.price.toFixed(2)),
            imageUrl: item.productId.imageUrl,
            quantity: item.quantity,
            totalPrice: Number(item.totalPrice.toFixed(2)),
          },
        })),
        grandTotalPrice: Number(updatedCart.grandTotalPrice.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("Delete Cart Product Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteEntireCart = async (req, res) => {
  const userId = req.user._id;

  try {
    const result = await Cart.findOneAndDelete({ user: userId });

    if (!result) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart deleted successfully" });
  } catch (err) {
    console.error("Delete Entire Cart Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
