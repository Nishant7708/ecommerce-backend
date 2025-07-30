import express from "express";
import { verifyToken, hasRole } from "../utils/authMiddleware.js";
import { createCategory } from "../controllers/Admin/Category/createCategory.js";
import { getAllCategories } from "../controllers/Admin/Category/getCategory.js";
import { updateCategory } from "../controllers/Admin/Category/updateCategory.js";
import { deleteCategory } from "../controllers/Admin/Category/deleteCategory.js";
import { getCategoryList } from "../controllers/Admin/Category/categoryList.js";

const router = express.Router();

router.post("/create", verifyToken, hasRole("admin"), createCategory);
router.get("/get", getAllCategories);
router.put("/update/:id", verifyToken, hasRole("admin"), updateCategory);
router.delete("/delete/:id", verifyToken, hasRole("admin"), deleteCategory);
router.get("/getList",verifyToken,hasRole("admin"),getCategoryList);

export default router;
