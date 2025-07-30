export const uploadCarouselImages = (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const filePaths = req.files.map(file => `/uploads/Carousel/${file.filename}`);

  res.status(200).json({
    message: "Images uploaded successfully!",
    filePaths,
  });
};
