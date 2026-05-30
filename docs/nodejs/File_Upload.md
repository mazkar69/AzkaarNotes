# File Upload — Multer (Express.js)

> **Package:** `multer`
> **Purpose:** Handle `multipart/form-data` file uploads in Express. Supports disk storage, memory storage, file type filtering, and size limits.

---

## Install

```sh
npm install multer
```

---

## Table of Contents

1. [Disk Storage](#disk-storage)
2. [File Filters](#file-filters)
3. [Upload Configurations](#upload-configurations)
4. [Memory Storage (for S3/Cloud)](#memory-storage-for-s3cloud)
5. [Multer Error Handler](#multer-error-handler)
6. [Usage in Routes](#usage-in-routes)

---

## Disk Storage

> Saves files to a local folder on the server.

```js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Folder must exist — create it manually or with fs.mkdirSync
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
        // Result: image-1234567890-987654321.jpg
    },
});
```

---

## File Filters

### Image Filter (jpeg, jpg, png, gif, webp)

```js
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);  // Accept file
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"), false);
    }
};
```

### Document Filter (pdf, doc, docx, xls, xlsx, txt)

```js
const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
        cb(null, true);
    } else {
        cb(new Error("Only document files are allowed (pdf, doc, docx, xls, xlsx, txt)"), false);
    }
};
```

---

## Upload Configurations

### Single Image (max 5MB)

```js
export const uploadSingleImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: imageFilter,
}).single("image"); // "image" = form field name
```

### Multiple Images (max 10 files, 5MB each)

```js
export const uploadMultipleImages = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).array("images", 10); // "images" = field name, 10 = max files
```

### Multiple Fields (different field names)

```js
export const uploadFields = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 5 },
]);
// Access: req.files.avatar[0], req.files.gallery[]
```

### Document Upload (max 10MB)

```js
export const uploadDocument = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: documentFilter,
}).single("document");
```

---

## Memory Storage (for S3/Cloud)

> Files go into RAM as `Buffer` instead of disk — required for streaming to S3 or other cloud storage.

```js
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
    storage: memoryStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFilter,
}).single("image");

// Access: req.file.buffer (Buffer), req.file.mimetype, req.file.originalname
```

---

## Multer Error Handler

> Must be a 4-argument middleware (`err, req, res, next`) and placed after the upload middleware in the route.

```js
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
            message: err.message, // Custom filter errors (e.g. wrong file type)
        });
    }

    next();
};
```

---

## Usage in Routes

```js
import express from "express";
import {
    uploadSingleImage,
    uploadMultipleImages,
    uploadToMemory,
    handleMulterError,
} from "./fileUpload.js";

const router = express.Router();

// Single file
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

// Multiple files
router.post("/upload-multiple", uploadMultipleImages, handleMulterError, (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    res.json({
        success: true,
        files: req.files.map((file) => ({
            filename: file.filename,
            path: file.path,
            size: file.size,
        })),
    });
});

// Memory storage → S3 upload
router.post("/upload-s3", uploadToMemory, handleMulterError, async (req, res) => {
    // req.file.buffer — use with AWS SDK S3 putObject
    const buffer = req.file.buffer;
    // await s3.upload({ Bucket, Key, Body: buffer }).promise();
    res.json({ success: true, message: "Uploaded to S3" });
});
```

---

## Multer Error Codes Reference

| Code | Cause |
|------|-------|
| `LIMIT_FILE_SIZE` | File exceeds `limits.fileSize` |
| `LIMIT_FILE_COUNT` | Too many files in `.array()` |
| `LIMIT_UNEXPECTED_FILE` | Field name not in `.fields()` list |
| `LIMIT_PART_COUNT` | Too many parts in multipart form |
| `LIMIT_FIELD_KEY` | Field name too long |
| `LIMIT_FIELD_VALUE` | Field value too long |

---

## File Object Reference (`req.file`)

| Property | Description |
|----------|-------------|
| `fieldname` | Field name from the form |
| `originalname` | Original file name on user's machine |
| `encoding` | File encoding type |
| `mimetype` | MIME type (e.g. `image/jpeg`) |
| `size` | File size in bytes |
| `destination` | Folder where file was saved (disk only) |
| `filename` | Name of the saved file (disk only) |
| `path` | Full path to saved file (disk only) |
| `buffer` | File as `Buffer` (memory only) |
