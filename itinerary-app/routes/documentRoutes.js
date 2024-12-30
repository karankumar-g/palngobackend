const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  checkDocumentExistence,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { authenticate } = require("../utils/jwt");

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure that req.user is populated, otherwise, return an error
    if (!req.user || !req.user.id) {
      return cb(new Error("User not authenticated"));
    }

    const folderPath = path.join(
      __dirname,
      "../uploads/documents",
      req.user.id
    );

    // Create directory if it doesn't exist
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF is allowed."), false);
  }
};

// Initialize multer with storage, file filter, and limits
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload Document route with error handling
router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  uploadDocument,
  (err, req, res, next) => {
    // Catch errors during file upload
    res.status(500).json({ error: err.message });
  }
);

// Get all documents for the logged-in user
router.get("/", authenticate, getDocuments);

// Get a specific document by its ID
router.get("/:id", authenticate, getDocumentById);

// Check if a specific document type is uploaded
router.get("/check", authenticate, checkDocumentExistence);

// Update an existing document (replace with a new one)
router.put("/update", authenticate, upload.single("document"), updateDocument);

// Delete a document
router.delete("/delete", authenticate, deleteDocument);

module.exports = router;
