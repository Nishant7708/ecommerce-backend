import Category from "../../../models/Category.js";

export const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find().select("name").sort({ name: 1 });

    return res.status(200).json({
      message: "Category list fetched successfully",
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
