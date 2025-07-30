// import fs from "fs";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import mongoose from "mongoose";
// import Product from "../../../models/Product.js";
// import Category from "../../../models/Category.js";

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid product ID." });
//     }

//     const allowedUpdates = [
//       "name",
//       "price",
//       "description",
//       "categoryName",
//       "originalImageUrl",
//       "status",
//       "imageBase64",
//     ];

//     const updates = Object.keys(req.body);
//     const isValidOperation = updates.every((key) => allowedUpdates.includes(key));

//     if (!isValidOperation) {
//       return res.status(400).json({ message: "Invalid updates detected." });
//     }

//     if ("status" in req.body && !["active", "inactive"].includes(req.body.status)) {
//       return res.status(400).json({ message: "Invalid status value." });
//     }

//     const existingProduct = await Product.findById(id);
//     if (!existingProduct) {
//       return res.status(404).json({ message: "Product not found." });
//     }

//     if (req.body.categoryName) {
//       const category = await Category.findOne({ name: req.body.categoryName });
//       if (!category) {
//         return res.status(400).json({ message: "Category not found." });
//       }
//       req.body.category = category._id;
//       delete req.body.categoryName;
//     }

//     if (req.body.imageBase64) {
//       const matches = req.body.imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
//       if (!matches) {
//         return res.status(400).json({ message: "Invalid base64 image format." });
//       }

//       const extension = matches[1];
//       const base64Data = matches[2];
//       const buffer = Buffer.from(base64Data, "base64");
//       const safeName = (req.body.name || existingProduct.name).toLowerCase().replace(/[^a-z0-9]/gi, "-");
//       const filename = `${safeName}-${uuidv4()}.${extension}`;
//       const uploadDir = path.join("uploads");

//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filepath = path.join(uploadDir, filename);
//       await fs.promises.writeFile(filepath, buffer);

//       if (existingProduct.image) {
//         const oldImagePath = path.join(uploadDir, existingProduct.image);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }

//       req.body.image = filename;
//       delete req.body.imageBase64;

//       if (!req.body.originalImageUrl) {
//         req.body.originalImageUrl = null;
//       }
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
//       new: true,
//       runValidators: true,
//       context: "query",
//     })
//       .populate("category", "name")
//       .lean();

//     if (!updatedProduct) {
//       return res.status(404).json({ message: "Product not found after update." });
//     }

//     const imageUrl = updatedProduct.image
//       ? `${req.protocol}://${req.get("host")}/uploads/${updatedProduct.image}`
//       : null;

//     res.status(200).json({
//       message:"Product Updated Successfully",
//       ...updatedProduct,
//       imageUrl,
//       originalImageUrl: updatedProduct.originalImageUrl,
//     });
//   } catch (err) {
//     console.error("Update Product Error:", err);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Product from "../../../models/Product.js";
import Category from "../../../models/Category.js";

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const allowedUpdates = [
      "name",
      "price",
      "description",
      "categoryName",
      "status",
    ];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates detected." });
    }

    if (
      "status" in req.body &&
      !["active", "inactive"].includes(req.body.status)
    ) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found." });
    }

    if (req.body.categoryName) {
      const category = await Category.findOne({ name: req.body.categoryName });
      if (!category) {
        return res.status(400).json({ message: "Category not found." });
      }
      req.body.category = category._id;
      delete req.body.categoryName;
    }

    if (req.files && req.files.image) {
      const uploadedFile = req.files.image;

      if (!uploadedFile.mimetype.startsWith("image/")) {
        return res
          .status(400)
          .json({ message: "Only image files are allowed." });
      }

      const extension = path.extname(uploadedFile.name);
      const safeName = (req.body.name || existingProduct.name)
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "-");

      const filename = `${safeName}-${Date.now()}${extension}`;
      const uploadDir = path.join("uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filepath = path.join(uploadDir, filename);
      await uploadedFile.mv(filepath);

      if (existingProduct.image) {
        const oldImagePath = path.join(uploadDir, existingProduct.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      req.body.image = filename;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    })
      .populate("category", "name")
      .lean();

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found after update." });
    }

    const imageUrl = updatedProduct.image
      ? `${req.protocol}://${req.get("host")}/uploads/${updatedProduct.image}`
      : null;

    res.status(200).json({
      message: "Product updated successfully",
      ...updatedProduct,
      imageUrl,
    });
  } catch (err) {
    console.error("Update Product Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
