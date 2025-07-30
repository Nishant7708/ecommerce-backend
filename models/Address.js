import mongoose from "mongoose";

const singleAddressSchema = new mongoose.Schema(
  {
    addressId: { type: Number },
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addresses: [singleAddressSchema],
  },
  {
    timestamps: true,
  }
);

addressSchema.pre("save", function (next) {
  if (!this.isModified("addresses")) return next();

  let currentMax = this.addresses.reduce((max, addr) => {
    return addr.addressId && addr.addressId > max ? addr.addressId : max;
  }, 0);

  this.addresses.forEach((addr) => {
    if (!addr.addressId) {
      currentMax += 1;
      addr.addressId = currentMax;
    }
  });

  next();
});

const Address = mongoose.model("Address", addressSchema);
export default Address;
