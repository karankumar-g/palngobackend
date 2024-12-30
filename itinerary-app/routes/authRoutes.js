const express = require("express");
const multer = require("multer");
const path = require("path");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Append timestamp to filename
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, and JPEG are allowed"),
      false
    );
  }
};

const upload = multer({ storage, fileFilter });

// Register route
router.post("/register", upload.single("photo"), register);

// Login route
router.post("/login", login);

module.exports = router;
