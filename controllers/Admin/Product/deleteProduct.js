import mongoose from "mongoose";
import Product from "../../../models/Product.js";

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (product.status === "deleted") {
      return res
        .status(400)
        .json({ message: "Product already marked as deleted." });
    }

    product.status = "deleted";
    await product.save();

    res
      .status(200)
      .json({ message: "Product marked as deleted successfully." });
  } catch (err) {
    console.error("Delete Product Error:", err.message);
    res.status(500).json({ message: "Failed to delete product." });
  }
};
