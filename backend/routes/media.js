import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/images",
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  },
});

const upload = multer({ storage });

// Upload image
router.post("/upload", upload.single("image"), (req, res) => {
  res.json({ path: `/uploads/images/${req.file.filename}` });
});

// Get all images
router.get("/all", (req, res) => {
  const files = fs.readdirSync("uploads/images");
  const images = files.map((f) => `/uploads/images/${f}`);
  res.json(images);
});

// Delete image
router.delete("/delete/:name", (req, res) => {
  fs.unlinkSync(`uploads/images/${req.params.name}`);
  res.json({ message: "Deleted" });
});

export default router;