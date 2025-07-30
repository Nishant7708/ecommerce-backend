import Address from "../../../models/Address.js";

const setDefaultAddress = async (req, res) => {
  const { addressId } = req.params;
  const userId = req.user._id;

  try {
    const addressDoc = await Address.findById(userId);
    if (!addressDoc) {
      return res.status(404).json({ success: false, message: "User address not found" });
    }

    let found = false;

    addressDoc.addresses.forEach((addr) => {
      if (addr.addressId === parseInt(addressId)) {
        addr.isDefault = true;
        found = true;
      } else {
        addr.isDefault = false;
      }
    });

    if (!found) {
      return res.status(404).json({ success: false, message: "Address ID not found" });
    }

    await addressDoc.save();

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      addresses: addressDoc.addresses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export default setDefaultAddress;
