import express from "express";
import { verifyToken, hasRole } from "../utils/authMiddleware.js";
import { userDashboard } from "../controllers/Admin/Dashboard/userDashboard.js";
import { categoryDashboard } from "../controllers/Admin/Dashboard/categoryDashboard.js";
import { orderDashboard } from "../controllers/Admin/Dashboard/orderDashboard.js";
import { productDashboard } from "../controllers/Admin/Dashboard/productDashboard.js";

const router = express.Router();

router.get("/usersDetails", verifyToken, hasRole("admin"), userDashboard);
router.get(
  "/categoriesDetails",
  verifyToken,
  hasRole("admin"),
  categoryDashboard
);
router.get("/ordersDetails", verifyToken, hasRole("admin"), orderDashboard);
router.get("/productsDetails", verifyToken, hasRole("admin"), productDashboard);
export default router;
