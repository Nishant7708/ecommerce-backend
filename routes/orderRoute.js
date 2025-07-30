import express from "express";
import { createOrder } from "../controllers/Admin/Order/createOrder.js";
import {
  getAllOrders,
  getOrderById,
} from "../controllers/Admin/Order/getOrder.js";
import { updateOrder } from "../controllers/Admin/Order/updateOrder.js";

import { verifyToken, hasRole } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, hasRole("user"), createOrder);
router.get("/getAll", verifyToken, hasRole("admin"), getAllOrders);
router.get("/get", verifyToken, hasRole("user","admin"), getOrderById);
router.put("/update/:_id", verifyToken, hasRole("admin"), updateOrder);

export default router;
