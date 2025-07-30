import Category from "../../../models/Category.js";
import Product from "../../../models/Product.js";

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.status === "deleted") {
      return res.status(400).json({ message: "Category is already deleted" });
    }

    const linkedProducts = await Product.find({ category: category._id });

    // if (linkedProducts.length > 0) {
    //   return res.status(400).json({
    //     message: "Cannot delete category. Products are linked to this category.",
    //     products: linkedProducts,
    //   });
    // }

    category.status = "deleted";
    await category.save();

    res.status(200).json({ message: "Category marked as deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// import Category from "../../../models/Category.js";
// import Product from "../../../models/Product.js";

// export const deleteCategory = async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.id);
//     if (!category) {
//       return res.status(404).json({ message: "Category not found" });
//     }

//     const linkedProducts = await Product.find({ category: category._id });

//     if (linkedProducts.length > 0) {
//       return res.status(400).json({
//         message: "Cannot delete category. Products are linked to this category.",
//         products: linkedProducts,
//       });
//     }

//     await Category.findByIdAndDelete(req.params.id);

//     res.status(200).json({ message: "Category deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };