import fs from "fs";
import path from "path";
import Product from "../../../models/Product.js";
import Category from "../../../models/Category.js";
import dotenv from "dotenv";
dotenv.config();

export const createProduct = async (req, res) => {
  try {
    console.log("📦 Received Body:", req.body);
    console.log("🖼️ Received Files:", req.files);

    const { name, price, description, categoryName } = req.body;

    console.log("➡️ name:", name);
    console.log("➡️ price:", price);
    console.log("➡️ description:", description);
    console.log("➡️ categoryName:", categoryName);

    if (!name || !price || !description || !categoryName) {
      return res.status(400).json({
        message: "Fields name, price, description, and categoryName are required.",
      });
    }

    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(400).json({ message: "Category not found." });
    }

    if (category.status === "deleted") {
      return res.status(400).json({
        message: "Cannot add product. Category is marked as deleted.",
      });
    }

    if (!req.files || !req.files.image) {
      console.log("❌ Image file not received");
      return res.status(400).json({
        message: "Product image file is required.",
      });
    }

    const uploadedFile = req.files.image;

    console.log("🧾 Uploaded file details:", {
      name: uploadedFile.name,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
    });

    if (!uploadedFile.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed." });
    }

    const extension = path.extname(uploadedFile.name);
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/gi, "-");
    const filename = `${safeName}-${Date.now()}${extension}`;

    const uploadDir = path.join("uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Upload directory created.");
    }

    const imagePath = path.join(uploadDir, filename);
    await uploadedFile.mv(imagePath);
    console.log("✅ File saved to:", imagePath);

    const imageUrl = `${process.env.BASE_URL}/uploads/${filename}`;

    const product = new Product({
      name,
      price,
      description,
      category: category._id,
      image: filename,
      imageUrl,
    });

    await product.save();

    console.log("✅ Product saved successfully:", product);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

