// import mongoose from "mongoose";
// import AutoIncrementFactory from "mongoose-sequence";

// const connection = mongoose.connection;
// const AutoIncrement = AutoIncrementFactory(connection);

// const productSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   description: { type: String, trim: true },
//   price: { type: Number, required: true, min: 0 },
//   category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
//   status: { type: String, enum: ["active", "inactive"], default: "active" },
//   deleted: { type: Boolean, default: false },
//   image: { type: String },
//   imageUrl: { type: String },
//   originalImageUrl: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });
// productSchema.plugin(AutoIncrement, { inc_field: "productId" });
// const Product = mongoose.model("Product", productSchema);

// export default Product;



import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const connection = mongoose.connection;
const AutoIncrement = AutoIncrementFactory(connection);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  status: { type: String, enum: ["active", "inactive","deleted"], default: "active" },
  image: { type: String },      
  imageUrl: { type: String },   
  createdAt: { type: Date, default: Date.now },
});

productSchema.plugin(AutoIncrement, { inc_field: "productId" });

const Product = mongoose.model("Product", productSchema);

export default Product;
