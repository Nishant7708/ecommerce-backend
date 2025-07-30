import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getCarouselImages = (req, res) => {
  const carouselDir = path.resolve(__dirname, "../../../uploads/Carousel");

  fs.readdir(carouselDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Carousel folder cannot be read." });
    }

    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    const serverHost =
      process.env.SERVER_HOST || req.hostname || req.ip || "localhost";
    const serverPort = process.env.PORT || 3000;

    const imageUrls = imageFiles.map(
      (file) =>
        `${req.protocol}://${serverHost}:${serverPort}/uploads/Carousel/${file}`
    );

    res.json({ images: imageUrls });
  });
};
