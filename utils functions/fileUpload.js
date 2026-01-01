import multer from "multer";
import path from "path";

// ============================================
// Basic Disk Storage Configuration
// ============================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Make sure this folder exists
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
});

// ============================================
// File Filter - Allow Only Specific Types
// ============================================
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"), false);
    }
};

const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error("Only document files are allowed (pdf, doc, docx, xls, xlsx, txt)"), false);
    }
};

// ============================================
// Upload Configurations
// ============================================

// Single Image Upload (max 5MB)
export const uploadSingleImage = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter,
}).single("image"); // field name: "image"

// Multiple Images Upload (max 10 files, 5MB each)
export const uploadMultipleImages = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).array("images", 10); // field name: "images", max 10 files

// Multiple Fields Upload
export const uploadFields = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
]);

// Document Upload
export const uploadDocument = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: documentFilter,
}).single("document");

// ============================================
// Memory Storage (for cloud upload like S3)
// ============================================
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).single("image");

// ============================================
// Error Handler Middleware for Multer
// ============================================
export const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum size allowed is 5MB",
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded",
            });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                success: false,
                message: "Unexpected field name in upload",
            });
        }
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};

// ============================================
// Usage Examples in Routes
// ============================================
/*
import express from "express";
import { uploadSingleImage, uploadMultipleImages, handleMulterError } from "./fileUpload.js";

const router = express.Router();

// Single file upload
router.post("/upload", uploadSingleImage, handleMulterError, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  
  res.json({
    success: true,
    message: "File uploaded successfully",
    file: {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
    },
  });
});

// Multiple files upload
router.post("/upload-multiple", uploadMultipleImages, handleMulterError, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }
  
  res.json({
    success: true,
    message: "Files uploaded successfully",
    files: req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      size: file.size,
    })),
  });
});
*/
