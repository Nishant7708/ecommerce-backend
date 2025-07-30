import express from "express";
import multer from "multer";
import path from "path";
import { getCarouselImages } from "../controllers/User/Carousel/getCarouselImages.js";
import { uploadCarouselImages } from "../controllers/User/Carousel/uploadCarouselImage.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/Carousel");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    if (!ext) {
      ext = ".jpg";
    }
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage: storage });

// Upload Multiple Images
router.post("/create", upload.array("images", 5), uploadCarouselImages);

// Get Images with Full URL including Server IP
router.get("/get", getCarouselImages);

export default router;
