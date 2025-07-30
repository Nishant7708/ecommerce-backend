import express from "express";
import { verifyToken, hasRole } from "../utils/authMiddleware.js";
import { createProduct } from "../controllers/Admin/Product/createProduct.js";
import{getAllProducts,getProductById}from "../controllers/Admin/Product/getProduct.js";
import{updateProduct}from "../controllers/Admin/Product/updateProduct.js";
import{deleteProduct}from "../controllers/Admin/Product/deleteProduct.js";

const router = express.Router();

router.post("/create", verifyToken, hasRole("admin"), createProduct);
router.put("/update/:id", verifyToken, hasRole("admin"), updateProduct);
router.delete("/delete/:id", verifyToken, hasRole("admin"), deleteProduct);

router.get("/get", getAllProducts);
router.get("/get/:id", getProductById);

export default router;
