import express from "express";
import { verifyToken, hasRole } from "../utils/authMiddleware.js";
import { Signup } from "../controllers/User/Auth/signUp.js";
import { Login } from "../controllers/User/Auth/login.js";
import { forgotPassword } from "../controllers/User/Auth/forgotPassword.js";
import { resetPasswordWithOTP } from "../controllers/User/Auth/resetPasswordwithOTP.js";
import { addToCart } from "../controllers/User/Cart/addCart.js";
import { getAllCarts, getCart } from "../controllers/User/Cart/getCart.js";
import {
  deleteCartProduct,
  deleteEntireCart,
} from "../controllers/User/Cart/deleteCart.js";
import { createAddress } from "../controllers/User/Address/createAddress.js";
import { getAddress } from "../controllers/User/Address/getAddress.js";
import { updateAddress } from "../controllers/User/Address/updateAddress.js";
import { deleteAddress } from "../controllers/User/Address/deleteAddress.js";
import setDefaultAddress from "../controllers/User/Address/defaultAddress.js";
const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPasswordWithOTP);

//Cart
router.post("/cart/add", verifyToken, hasRole("user"), addToCart);
router.get("/cart", verifyToken, getCart);
router.get("/carts", verifyToken, hasRole("admin"), getAllCarts);
router.delete("/cart/product/:productId", verifyToken, deleteCartProduct);
router.delete("/cart", verifyToken, deleteEntireCart);

//Address
router.post("/createAddress", verifyToken, hasRole("user"), createAddress);
router.get("/getAddress", verifyToken, hasRole("user"), getAddress);
router.put("/updateAddress", verifyToken, hasRole("user"), updateAddress);
router.delete(
  "/deleteAddress/:addressId",
  verifyToken,
  hasRole("user"),
  deleteAddress
);
router.patch(
  "/setDefaultAddress/:addressId",
  verifyToken,
  hasRole("user"),
  setDefaultAddress
);

export default router;
