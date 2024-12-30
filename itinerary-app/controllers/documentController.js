const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Document = require("../models/documentModels");
const app = express();

// Middleware for parsing JSON and form-data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Only PDF files are allowed"), false);
  }
  cb(null, true);
};

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = path.join(
      __dirname,
      "../uploads/documents",
      req.user.id
    );
    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        return cb(new Error("Error creating directory"));
      }
      cb(null, folderPath);
    });
  },
  filename: (req, file, cb) => {
    // Using the document type as the filename
    const fileName = `${req.body.documentType}_${Date.now()}.pdf`;
    cb(null, fileName);
  },
});

// Multer middleware for file upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// POST route to upload the document
app.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ msg: "Document type is required" });
    }

    // Store the document metadata in the database
    const newDocument = new Document({
      userId: req.user.id, // Assuming `req.user.id` is available from authentication
      documentType,
      filePath: path.join(
        "uploads",
        "documents",
        req.user.id,
        req.file.filename
      ),
      originalFileName: req.file.originalname,
    });

    await newDocument.save();

    res.status(201).json({
      msg: "Document uploaded successfully",
      documentId: newDocument._id,
      document: newDocument,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", details: error.message });
  }
});

// GET route to fetch all documents for a specific user
app.get("/documents", async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.id });
    res.status(200).json(documents);
  } catch (error) {
    console.error("Error retrieving documents:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", details: error.message });
  }
});

// GET route to fetch a specific document by ID
app.get("/documents/:id", async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error("Error retrieving document:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", details: error.message });
  }
});

// PUT route to update a specific document
app.put("/documents/:id", upload.single("document"), async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!documentType) {
      return res.status(400).json({ msg: "Document type is required" });
    }

    const document = await Document.findOneAndUpdate(
      { userId: req.user.id, documentType },
      {
        filePath: path.join(
          "uploads",
          "documents",
          req.user.id,
          req.file.filename
        ),
        originalFileName: req.file.originalname,
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    res.status(200).json({ msg: "Document updated successfully", document });
  } catch (error) {
    console.error("Error updating document:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", details: error.message });
  }
});

// DELETE route to delete a specific document
app.delete("/documents/:id", async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: "Document not found" });
    }

    const filePath = path.join(__dirname, "../uploads", document.filePath);
    fs.exists(filePath, (exists) => {
      if (exists) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log(`File deleted successfully: ${filePath}`);
          }
        });
      }
    });

    res.status(200).json({ msg: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res
      .status(500)
      .json({ msg: "Internal server error", details: error.message });
  }
});

// Starting the server
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
