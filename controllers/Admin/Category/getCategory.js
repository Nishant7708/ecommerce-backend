import Category from "../../../models/Category.js";

export const getAllCategories = async (req, res) => {
  try {
    const {
      sortBy = "categoryId",
      order = "asc",
      page = 1,
      limit = 10,
    } = req.query;

  
    let { search } = req.query;
    let searchParams = {};
    if (search) {
      try {
        searchParams = JSON.parse(search);
      } catch (err) {
        return res.status(400).json({ message: "Invalid search parameter" });
      }
    }

    const { name = "", categoryId = "", status = "" } = searchParams;

    
    const filters = {};
    if (name) filters.name = { $regex: name, $options: "i" };
    if (categoryId && !isNaN(Number(categoryId))) {
      filters.categoryId = Number(categoryId);
    }
    if (status) filters.status = status;

    
    const parsedPage = parseInt(page) || 1;
    const parsedLimit = parseInt(limit) || 10;
    const skip = (parsedPage - 1) * parsedLimit;
    const sortOrder = order === "asc" ? 1 : -1;

    
    const pipeline = [
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "category",
          as: "products",
        },
      },
      { $match: filters },
      {
        $project: {
          _id: 1,
          categoryId: 1,
          name: 1,
          description: 1,
          status: 1,
          createdAt: 1,
          productCount: { $size: "$products" },
         
        },
      },
      { $sort: { [sortBy]: sortOrder } },
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: parsedLimit }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Category.aggregate(pipeline);
    const categories = result[0].paginatedResults;
    const total = result[0].totalCount[0]?.count || 0;

    return res.status(200).json({
      message: "Categories fetched successfully",
      success: true,
      data: categories,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// import Category from "../../../models/Category.js";

// export const getAllCategories = async (req, res) => {
//   try {
//     const {
//       name,
//       categoryId,
//       status,
//       sortBy = "categoryId",
//       order = "asc",
//       page = 1,
//       limit = 10,
//     } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const sortOrder = order === "asc" ? 1 : -1;

//     const filters = {};
//     if (name) filters.name = { $regex: name, $options: "i" };
//     if (categoryId) filters.categoryId = Number(categoryId);
//     if (status) filters.status = status;

//     const pipeline = [
//       {
//         $lookup: {
//           from: "products",
//           localField: "_id",
//           foreignField: "category",
//           as: "products",
//         },
//       },
//       { $match: filters },
//       {
//         $project: {
//           _id: 1,
//           categoryId: 1,
//           name: 1,
//           description: 1,
//           status: 1,
//           createdAt: 1,
//           productCount: { $size: "$products" },
//           products: 1,
//         },
//       },
//       { $sort: { [sortBy]: sortOrder } },
//       {
//         $facet: {
//           paginatedResults: [{ $skip: skip }, { $limit: parseInt(limit) }],
//           totalCount: [{ $count: "count" }],
//         },
//       },
//     ];

//     const result = await Category.aggregate(pipeline);
//     const categories = result[0].paginatedResults;
//     const total = result[0].totalCount[0]?.count || 0;

//     return res.status(200).json({
//       message: "Categories fetched successfully",
//       success: true,
//       data: categories,
//       pagination: {
//         total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching categories:", error.message);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
