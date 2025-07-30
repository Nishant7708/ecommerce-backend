import Category from "../../../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists." });
    }

    const category = new Category({
      name: name.trim(),
      description: description || "",
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
