import mongoose from "mongoose";
import Address from "../../../models/Address.js";

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { street, city, state, postalCode, country, addressId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!addressId || !street || !city || !state || !postalCode || !country) {
      return res.status(400).json({
        message:
          "All fields (addressId, street, city, state, postalCode, country) are required.",
      });
    }

    const userAddress = await Address.findById(userId);
    if (!userAddress) {
      return res.status(404).json({ message: "User address not found" });
    }

    const currentAddress = userAddress.addresses.find(
      (addr) => addr.addressId === addressId
    );

    if (!currentAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    const isDuplicate = userAddress.addresses.some((addr) => {
      return (
        addr.addressId !== addressId &&
        addr.street === street &&
        addr.city === city &&
        addr.state === state &&
        addr.postalCode === postalCode &&
        addr.country === country
      );
    });

    if (isDuplicate) {
      return res.status(409).json({
        message: "An address with the same details already exists",
      });
    }

    const updated = await Address.findOneAndUpdate(
      { _id: userId, "addresses.addressId": addressId },
      {
        $set: {
          "addresses.$.street": street,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.postalCode": postalCode,
          "addresses.$.country": country,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Address Updated Successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updateAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot Update Address",
      error: error.message,
    });
  }
};
