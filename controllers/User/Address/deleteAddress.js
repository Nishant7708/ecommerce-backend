import mongoose from "mongoose";
import Address from "../../../models/Address.js";

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!addressId) {
      return res.status(400).json({ message: "addressId is required" });
    }
    const userAddressDoc = await Address.findOne({
      _id: userId,
      "addresses.addressId": addressId,
    });

    if (!userAddressDoc) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    await Address.findOneAndUpdate(
      { _id: userId },
      { $pull: { addresses: { addressId } } }
    );

    return res
      .status(200)
      .json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Address cannot be deleted",
      error: error.message,
    });
  }
};

// import mongoose from "mongoose";
// import Address from "../../../models/Address.js";

// export const deleteAddress = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { addressId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: "Invalid userId" });
//     }

//     if (!addressId) {
//       return res.status(400).json({ message: "addressId is required" });
//     }

//     const result = await Address.findOneAndUpdate(
//       { _id: userId },
//       { $pull: { addresses: { addressId } } },
//       { new: true }
//     );

//     const wasDeleted =
//       result?.addresses?.some((a) => a.addressId === addressId) === false;

//     if (!wasDeleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Address not found or already deleted",
//       });
//     }

//     return res
//       .status(200)
//       .json({ success: true, message: "Address deleted successfully" });
//   } catch (error) {
//     console.error("Delete Address Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Address cannot be deleted",
//       error: error.message,
//     });
//   }
// };
