import Address from "../../../models/Address.js";
import mongoose from "mongoose";

export const getAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing user ID" });
    }

    const result = await Address.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$addresses" },
      { $sort: { "addresses.addressId": 1 } },
      {
        $addFields: {
          "addresses.fullAddress": {
            $concat: [
              "$addresses.street",
              ", ",
              "$addresses.city",
              ", ",
              "$addresses.state",
              ", ",
              "$addresses.postalCode",
              ", ",
              "$addresses.country",
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          addresses: { $push: "$addresses" },
        },
      },
      {
        $project: {
          _id: 0,
          addresses: 1,
        },
      },
    ]);

    const addressList = result[0]?.addresses || [];

    return res
      .status(200)
      .json({ message: "Address list fetched successfully", addressList });
  } catch (err) {
    console.error("Error in getAddress:", err);
    return res.status(500).json({
      message: "Failed to fetch addresses",
      error: err.message,
    });
  }
};

// import Address from "../../../models/Address.js";
// import mongoose from "mongoose";

// export const getAddress = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid or missing user ID" });
//     }

//     const result = await Address.aggregate([
//       { $match: { _id: new mongoose.Types.ObjectId(userId) } },
//       { $unwind: "$addresses" },
//       { $sort: { "addresses.addressId": 1 } },
//       {
//         $group: {
//           _id: "$_id",
//           addresses: { $push: "$addresses" },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           addresses: 1,
//         },
//       },
//     ]);

//     const addressList = result[0]?.addresses || [];

//     return res
//       .status(200)
//       .json({ message: "Address list fetched successfully", addressList });
//   } catch (err) {
//     console.error("Error in getAddress:", err);
//     return res.status(500).json({
//       message: "Failed to fetch addresses",
//       error: err.message,
//     });
//   }
// };
