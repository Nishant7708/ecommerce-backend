import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetOTP: String,
    otpExpires: Date,
  },
  {
    timestamps: true,
  }
);

adminSchema.plugin(AutoIncrement, { inc_field: "adminId" });


adminSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name
      .trim()
      .replace(/\s+/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }
  next();
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
