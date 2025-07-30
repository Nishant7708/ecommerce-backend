import Address from "../../../models/Address.js";
import mongoose from "mongoose";

const validateAddress = (addr) => {
  const { street, city, state, postalCode, country } = addr;

  if (!street || !city || !state || !postalCode || !country) {
    throw new Error(
      "Each address must contain street, city, state, postalCode, and country."
    );
  }

  return { street, city, state, postalCode, country };
};

const isDuplicate = (existing, incoming) => {
  return (
    existing.street === incoming.street &&
    existing.city === incoming.city &&
    existing.state === incoming.state &&
    existing.postalCode === incoming.postalCode &&
    existing.country === incoming.country
  );
};

export const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const inputAddresses = req.body.addresses;

    if (!Array.isArray(inputAddresses) || inputAddresses.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide at least one address." });
    }

    const validatedAddresses = inputAddresses.map(validateAddress);
    let userAddressDoc = await Address.findById(userId);

    if (userAddressDoc) {
      const existing = userAddressDoc.addresses;

      const uniqueNewAddresses = validatedAddresses.filter(
        (newAddr) => !existing.some((e) => isDuplicate(e, newAddr))
      );

      const totalAfterInsert = existing.length + uniqueNewAddresses.length;

      if (uniqueNewAddresses.length === 0) {
        return res
          .status(409)
          .json({ message: "Duplicate address(es) not allowed." });
      }

      if (totalAfterInsert > 10) {
        return res.status(400).json({
          message: "Cannot add addresses. Maximum limit of 10 addresses exceeded.",
        });
      }

      userAddressDoc.addresses.push(...uniqueNewAddresses);
    } else {
      if (validatedAddresses.length > 10) {
        return res.status(400).json({
          message: "Cannot add more than 10 addresses per user.",
        });
      }

      userAddressDoc = new Address({
        _id: userId,
        addresses: validatedAddresses,
      });
    }

    await userAddressDoc.save();

    return res.status(201).json({
      message: "Addresses added successfully",
      data: userAddressDoc,
    });
  } catch (err) {
    console.error("Error in createAddress:", err);
    return res.status(500).json({
      message: "Failed to add addresses",
      error: err.message,
    });
  }
};
