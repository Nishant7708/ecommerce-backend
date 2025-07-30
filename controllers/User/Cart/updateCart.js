import Cart from "../../../models/Cart.js";

export const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const { id } = req.params; // id = user._id

  if (!productId || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Valid productId and quantity are required." });
  }

  try {
    const cart = await Cart.findOne({ user: id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.products[productIndex].quantity = quantity;

    // Optional: Update total price for that product
    const productData = await Cart.model("Product").findById(productId).lean();
    if (productData) {
      cart.products[productIndex].totalPrice = parseFloat((productData.price * quantity).toFixed(2));
    }

    // Optional: Update grand total again
    cart.grandTotalPrice = parseFloat(
      cart.products.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)
    );

    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error("Update Cart Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
