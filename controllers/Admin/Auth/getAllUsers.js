import User from "../../../models/User.js";

export const getallUsers = async (req, res) => {
  try {
    let { search = "{}", page = 1, limit = 10, sortBy = "userId", sortOrder = "asc" } = req.query;

    try {
      search = JSON.parse(search);
    } catch {
      return res.status(400).json({ message: "Invalid search query format" });
    }

    const { userId, name, email, status, gender } = search;
    const matchStage = {};

    if (userId !== undefined && userId !== null && String(userId).trim()) {
      if (isNaN(userId)) {
        return res.status(400).json({ message: "userId must be a number" });
      }
      matchStage.userId = Number(userId);
    }

    if (name?.trim()) {
      matchStage.name = { $regex: name.trim(), $options: "i" };
    }

    if (email?.trim()) {
      matchStage.email = { $regex: email.trim(), $options: "i" };
    }

    if (status?.trim()) {
      matchStage.status = status.trim();
    }

    if (gender?.trim()) {
      matchStage.gender = gender.trim();
    }

    const allowedSortFields = ["name", "email", "userId"];
    if (!allowedSortFields.includes(sortBy)) {
      sortBy = "userId"; 
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;
    const sortDirection = sortOrder === "desc" ? -1 : 1;

    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $project: {
          password: 0,
          resetOTP: 0,
          otpExpires: 0,
        },
      },
      {
        $sort: { [sortBy]: sortDirection },
      },
      {
        $facet: {
          paginatedResults: [{ $skip: skip }, { $limit: limitNumber }],
          totalCount: [{ $count: "count" }],
        },
      }
    );

    const result = await User.aggregate(pipeline);

    const users = result[0].paginatedResults;
    const totalUsers = result[0].totalCount[0]?.count || 0;

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      limit: limitNumber,
      totalUsers,
      Users: users,
    });

  } catch (error) {
    console.error("Get All Users Error:", error.message);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};


// import User from "../../../models/User.js";

// export const getallUsers = async (req, res) => {
//   try {
//     let { search = "{}", page = 1, limit = 10 } = req.query;

//     try {
//       search = JSON.parse(search);
//     } catch (err) {
//       return res.status(400).json({ message: "Invalid search query format" });
//     }

//     const { userId, name, email, status, gender } = search;
//     const query = {};

//     if (userId !== undefined && userId !== null && String(userId).trim()) {
//       if (isNaN(userId)) {
//         return res.status(400).json({ message: "userId must be a number" });
//       }
//       query.userId = Number(userId);
//     }

//     if (name?.trim()) {
//       query.name = { $regex: name.trim(), $options: "i" };
//     }

//     if (email?.trim()) {
//       query.email = { $regex: email.trim(), $options: "i" };
//     }

//     if (status?.trim()) {
//       query.status = status.trim();
//     }

//      if (gender?.trim()) {
//       query.gender = gender.trim();
//     }

//     const pageNumber = Math.max(1, parseInt(page, 10) || 1);
//     const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
//     const skip = (pageNumber - 1) * limitNumber;

//     const [users, totalUsers] = await Promise.all([
//       User.find(query, "-password -resetOTP -otpExpires")
//         .skip(skip)
//         .limit(limitNumber),
//       User.countDocuments(query),
//     ]);

//     if (!users.length) {
//       return res.status(404).json({ message: "No matching users found." });
//     }

//     return res.status(200).json({
//       success: true,
//       currentPage: pageNumber,
//       limit: limitNumber,
//       totalUsers,
//       Users: users,  
//     });
//   } catch (error) {
//     console.error("Get All Users Error:", error.message);
//     return res.status(500).json({ message: "Failed to fetch users" });
//   }
// };
