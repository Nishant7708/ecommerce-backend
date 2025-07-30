import Cart from "../../../models/Cart.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("products.productId", "name price stock image")
      .lean();

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const host = `${req.protocol}://${req.get("host")}`;

    cart.products.forEach(item => {
      if (item.productId?.image) {
        item.productId.imageUrl = `${host}/uploads/${item.productId.image}`;
      }
    });

    res.status(200).json(cart);
  } catch (err) {
    console.error("Get Cart Error:", err.message);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

export const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("user", "name email")
      .populate("products.productId", "name price stock image")
      .lean();

    const host = `${req.protocol}://${req.get("host")}`;

    carts.forEach(cart => {
      cart.products.forEach(item => {
        if (item.productId?.image) {
          item.productId.imageUrl = `${host}/uploads/${item.productId.image}`;
        }
      });
    });

    res.status(200).json(carts);
  } catch (error) {
    console.error("Get All Carts Error:", error.message);
    res.status(500).json({ message: "Failed to fetch carts" });
  }
};
