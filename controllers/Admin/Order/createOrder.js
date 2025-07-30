import Address from "../../../models/Address.js";
import Order from "../../../models/Order.js";
import Cart from "../../../models/Cart.js";
import Product from "../../../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod = "COD", addressId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const addressDoc = await Address.findById(userId).lean();
    if (!addressDoc) {
      return res.status(404).json({ message: "Address not found for user." });
    }

    const selectedAddress = addressDoc.addresses.find(
      (addr) => addr.addressId === addressId
    );

    if (!selectedAddress) {
      return res.status(400).json({ message: "Selected address not found." });
    }

    const {
      street,
      city,
      state,
      postalCode,
      country = "India",
    } = selectedAddress;

    const productIds = cart.products.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = Object.fromEntries(
      products.map((product) => [product._id.toString(), product])
    );

    const orderProducts = [];
    const responseProducts = [];
    let grandTotalPrice = 0;

    for (const item of cart.products) {
      const product = productMap[item.productId.toString()];
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}`,
        });
      }

      const total = product.price * item.quantity;
      grandTotalPrice += total;

      orderProducts.push({
        _id: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      responseProducts.push({
        productId: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: item.quantity,
        total,
      });

      await Product.updateOne(
        { _id: product._id },
        { $inc: { stock: -item.quantity } }
      );
    }

    const newOrder = new Order({
      userId,
      products: orderProducts,
      grandTotalPrice,
      shippingAddress: { street, city, state, postalCode, country },
      paymentMethod,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newOrder.save();

    await Cart.findByIdAndUpdate(cart._id, {
      $set: { products: [], grandTotalPrice: 0 },
    });

    return res.status(201).json({
      message: "Order placed successfully.",
      order: {
        _id: newOrder._id,
        orderId: newOrder.orderId,
        products: responseProducts,
        totalPrice: grandTotalPrice,
        paymentMethod: newOrder.paymentMethod,
        shippingAddress: newOrder.shippingAddress,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Order creation failed:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
  }
};

// import Address from "../../../models/Address.js";
// import Order from "../../../models/Order.js";
// import Cart from "../../../models/Cart.js";
// import Product from "../../../models/Product.js";

// export const createOrder = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { paymentMethod = "COD", addressId } = req.body;

//     const cart = await Cart.findOne({ user: userId });
//     if (!cart || cart.products.length === 0) {
//       return res.status(400).json({ message: "Cart is empty." });
//     }

//     const addressDoc = await Address.findById(userId).lean();
//     if (!addressDoc) {
//       return res
//         .status(404)
//         .json({ message: "Address document not found for user." });
//     }

//     const selectedAddress = addressDoc.addresses.find(
//       (addr) => addr.addressId === addressId
//     );

//     if (!selectedAddress) {
//       return res.status(400).json({ message: "Selected address not found." });
//     }

//     const { street, city, state, postalCode, country } = selectedAddress;

//     const productIds = cart.products.map((item) => item.productId);
//     const products = await Product.find({ _id: { $in: productIds } });

//     const productMap = Object.fromEntries(
//       products.map((product) => [product._id.toString(), product])
//     );

//     const orderProducts = [];
//     const responseProducts = [];
//     let grandTotalPrice = 0;

//     for (const item of cart.products) {
//       const product = productMap[item.productId.toString()];
//       if (!product) {
//         return res
//           .status(404)
//           .json({ message: `Product not found: ${item.productId}` });
//       }

//       if (product.stock < item.quantity) {
//         return res.status(400).json({
//           message: `Insufficient stock for product: ${product.name}`,
//         });
//       }

//       const total = product.price * item.quantity;
//       grandTotalPrice += total;

//       orderProducts.push({
//         _id: product._id,
//         quantity: item.quantity,
//         price: product.price,
//       });

//       responseProducts.push({
//         productId: product._id,
//         name: product.name,
//         imageUrl: product.imageUrl ,
//         price: product.price,
//         quantity: item.quantity,
//         total,
//       });

//       await Product.updateOne(
//         { _id: product._id },
//         { $inc: { stock: -item.quantity } }
//       );
//     }

//     const newOrder = new Order({
//       userId,
//       products: orderProducts,
//       grandTotalPrice,
//       shippingAddress: { street, city, state, postalCode, country },
//       paymentMethod,
//     });

//     await newOrder.save();

//     await Cart.findByIdAndUpdate(cart._id, {
//       $set: { products: [], grandTotalPrice: 0 },
//     });

//     return res.status(201).json({
//       message: "Order placed successfully.",
//       order: {
//         _id: newOrder._id,
//         orderId: newOrder.orderId,
//         products: responseProducts,
//         totalPrice: grandTotalPrice,
//         paymentMethod: newOrder.paymentMethod,
//         shippingAddress: newOrder.shippingAddress,
//         status: newOrder.status,
//         createdAt: newOrder.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Order creation failed:", error);
//     return res
//       .status(500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// };
