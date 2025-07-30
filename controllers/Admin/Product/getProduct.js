import Product from "../../../models/Product.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    let { search = "{}", page = 1, limit = 10 } = req.query;

    // Step 1: Safely parse the search param
    try {
      search = JSON.parse(search);
    } catch {
      return res
        .status(400)
        .json({ message: "Invalid search query format. Must be valid JSON." });
    }

    console.log("🔍 Parsed Search Object:", search); // ✅ Debug log

    // Step 2: Convert pagination params to integers
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    const skip = (page - 1) * limit;

    const matchStage = {};

    // Step 3: Search by name (case-insensitive)
    if (search.name) {
      matchStage.name = { $regex: search.name, $options: "i" };
    }

    // Step 4: Search by productId (number)
    if (search.productId) {
      const parsedId = parseInt(search.productId);
      if (isNaN(parsedId)) {
        return res
          .status(400)
          .json({ message: "Invalid productId. Must be a number." });
      }
      matchStage.productId = parsedId;
    }

    // ✅ Step 5: Status-based filtering (including 'deleted')
    if (
      search.status === "active" ||
      search.status === "inactive" ||
      search.status === "deleted"
    ) {
      matchStage.status = search.status;
    } else if (!search.status || search.status === "") {
      matchStage.status = { $ne: "deleted" }; // default: exclude deleted
    } else {
      return res.status(400).json({
        message: "Invalid status. Must be 'active', 'inactive', or 'deleted'.",
      });
    }

    // Step 6: Build aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ];

    // Step 7: Filter by category name (optional)
    if (search.category) {
      pipeline.push({
        $match: {
          "category.name": search.category,
        },
      });
    }

    // Step 8: Optimize payload
    pipeline.push(
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          category: { name: 1 },
          productId: 1,
          image: 1,
          status: 1,
        },
      },
      { $sort: { productId: 1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      }
    );

    // Step 9: Execute query
    const result = await Product.aggregate(pipeline);

    // Step 10: Format response with imageUrl
    const products = result[0].paginatedResults.map((product) => ({
      ...product,
      imageUrl: product.image
        ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
        : null,
    }));

    // Step 11: Send response
    res.status(200).json({
      products,
      total: result[0].totalCount[0]?.count || 0,
      page,
      pages: Math.ceil((result[0].totalCount[0]?.count || 0) / limit),
    });
  } catch (err) {
    console.error("Get All Products Error:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    // Build dynamic filter
    const filter = { _id: id };
    if (status === "active" || status === "inactive" || status === "deleted") {
      filter.status = status;
    } else {
      // Default behavior (no status provided): exclude deleted products
      filter.status = { $ne: "deleted" };
    }

    const product = await Product.findOne(filter)
      .populate("category", "name")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const productObj = {
      ...product,
      imageUrl: product.image
        ? `${req.protocol}://${req.get("host")}/uploads/${product.image}`
        : null,
    };

    res.status(200).json(productObj);
  } catch (err) {
    console.error("Get Product By ID Error:", err);
    res.status(500).json({ message: "An unexpected error occurred." });
  }
};
