import Product from "../../../models/Product.js";
import Cart from "../../../models/Cart.js";

export const addToCart = async (req, res) => {
  const { productId } = req.body;
  const quantity = parseInt(req.body.quantity);
  const userId = req.user._id;

  if (!productId || isNaN(quantity) || quantity === 0) {
    return res
      .status(400)
      .json({ message: "Valid productId and non-zero quantity are required." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      if (quantity < 0) {
        return res
          .status(400)
          .json({ message: "Cannot reduce quantity for non-existing cart." });
      }
      cart = new Cart({ user: userId, products: [] });
    }

    const productIndex = cart.products.findIndex((p) =>
      p.productId.equals(productId)
    );

    if (productIndex > -1) {
      const existingQty = cart.products[productIndex].quantity;
      const newQty = existingQty + quantity;

      if (newQty > product.stock) {
        return res.status(400).json({
          message: `Adding ${quantity} exceeds stock limit. Current in cart: ${existingQty}, Stock: ${product.stock}`,
        });
      }

      if (newQty <= 0) {
        cart.products.splice(productIndex, 1);
      } else {
        cart.products[productIndex].quantity = newQty;
      }
    } else {
      if (quantity < 0) {
        return res.status(400).json({
          message: "Cannot reduce quantity for a product not in cart.",
        });
      }
      cart.products.push({ productId, quantity });
    }

    // if (cart.products.length === 0) {
    //   await Cart.findByIdAndDelete(cart._id);
    //   return res
    //     .status(200)
    //     .json({ message: "Cart is now empty and removed." });
    // }

    const productsData = await Product.find({
      _id: { $in: cart.products.map((item) => item.productId) },
    });

    const productMap = productsData.reduce((acc, prod) => {
      acc[prod._id.toString()] = prod.price;
      return acc;
    }, {});

    cart.products = cart.products.map((item) => {
      const price = productMap[item.productId.toString()] || 0;
      item.totalPrice = Number((price * item.quantity).toFixed(2));
      return item;
    });

    cart.grandTotalPrice = Number(
      cart.products.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate("products.productId", "name price imageUrl")
      .lean();

    res.status(200).json({
      cart: {
        _id: populatedCart._id,
        user: populatedCart.user,
        products: populatedCart.products.map((item) => ({
          productId: {
            _id: item.productId._id,
            name: item.productId.name,
            price: Number(item.productId.price.toFixed(2)),
            imageUrl: item.productId.imageUrl,
          },
          quantity: item.quantity,
          totalPrice: Number(item.totalPrice.toFixed(2)),
        })),
        grandTotalPrice: Number(populatedCart.grandTotalPrice.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Add to Cart Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// import Product from "../../../models/Product.js";
// import Cart from "../../../models/Cart.js";

// export const addToCart = async (req, res) => {
//   const { productId } = req.body;
//   const quantity = parseInt(req.body.quantity);
//   const userId = req.user._id;

//   if (!productId || isNaN(quantity) || quantity <= 0) {
//     return res.status(400).json({ message: "Valid productId and quantity are required." });
//   }

//   try {
//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     let cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       cart = new Cart({ user: userId, products: [] });
//     }

//     const productIndex = cart.products.findIndex((p) => p.productId.equals(productId));

//     if (productIndex > -1) {
//       const existingQty = cart.products[productIndex].quantity;
//       const totalRequested = existingQty + quantity;

//       if (totalRequested > product.stock) {
//         return res.status(400).json({
//           message: `Adding ${quantity} exceeds stock limit. Current in cart: ${existingQty}, Stock: ${product.stock}`,
//         });
//       }

//       cart.products[productIndex].quantity += quantity;
//     } else {
//       cart.products.push({ productId, quantity });
//     }

//     cart.products = cart.products.filter((item) => item.quantity > 0);

//     if (cart.products.length === 0) {
//       if (cart._id) {
//         const deleted = await Cart.findByIdAndDelete(cart._id);
//         console.log("Deleted cart:", deleted);
//       } else {
//         await Cart.deleteOne({ user: userId });
//         console.log("Deleted cart by user ID.");
//       }
//       return res.status(200).json({ message: "Cart is now empty and removed." });
//     }

//     const productsData = await Product.find({
//       _id: { $in: cart.products.map((item) => item.productId) },
//     });

//     const productMap = productsData.reduce((acc, prod) => {
//       acc[prod._id.toString()] = prod.price;
//       return acc;
//     }, {});

//     cart.products = cart.products.map((item) => {
//       const price = productMap[item.productId.toString()] || 0;
//       item.totalPrice = Number((price * item.quantity).toFixed(2));
//       return item;
//     });

//     cart.grandTotalPrice = Number(
//       cart.products.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
//     );

//     console.log("Cart before save:", cart);

//     await cart.save();

//     console.log("Cart successfully saved.");
//     const populatedCart = await Cart.findById(cart._id)
//       .populate("products.productId", "name price imageUrl")
//       .lean();

//     res.status(200).json({
//       cart: {
//         _id: populatedCart._id,
//         user: populatedCart.user,
//         products: populatedCart.products.map((item) => ({
//           productId: {
//             _id: item.productId._id,
//             name: item.productId.name,
//             price: Number(item.productId.price.toFixed(2)),
//             imageUrl : item.productId.imageUrl
//           },
//           quantity: item.quantity,
//           totalPrice: Number(item.totalPrice.toFixed(2)),
//         })),
//         grandTotalPrice: Number(populatedCart.grandTotalPrice.toFixed(2)),
//       },
//     });
//   } catch (error) {
//     console.error("Add to Cart Error:", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };
