import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_USERSECRET = process.env.JWT_USERSECRET;
const JWT_ADMINSECRET = process.env.JWT_ADMINSECRET;

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const unverified = jwt.decode(token);
    console.log("Decoded token (unverified):", unverified);

    if (!unverified || !unverified.role) {
      return res.status(400).json({ message: "Invalid token structure" });
    }

    const secret =
      unverified.role === "admin" ? JWT_ADMINSECRET : JWT_USERSECRET;

    if (!secret) {
      return res
        .status(500)
        .json({ message: "JWT secret not configured properly" });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const hasRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({ message: `Access Denied: Only for ${allowedRoles.join(", ")}` });
  };
};

