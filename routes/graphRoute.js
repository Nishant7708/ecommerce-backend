import express from "express";
import { verifyToken, hasRole } from "../utils/authMiddleware.js";
import { userGraph } from "../controllers/Admin/Graph/userGraph.js";
import { categoryGraph } from "../controllers/Admin/Graph/categoryGraph.js";
import { productGraph } from "../controllers/Admin/Graph/productGraph.js";
import { orderGraph } from "../controllers/Admin/Graph/orderGraph.js";
const router = express.Router();

router.get("/userGraph", verifyToken, hasRole("admin"), userGraph);
router.get("/categoryGraph", verifyToken, hasRole("admin"), categoryGraph);
router.get("/productGraph", verifyToken, hasRole("admin"), productGraph);
router.get("/orderGraph", verifyToken, hasRole("admin"), orderGraph);

export default router;
