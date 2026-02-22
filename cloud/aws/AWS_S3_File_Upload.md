# AWS S3 - File Upload and Management

> Last Updated: February 22, 2026

## Table of Contents
- [Prerequisites](#prerequisites)
- [AWS CLI - S3 Commands](#aws-cli---s3-commands)
- [Node.js - S3 Upload with AWS SDK v3](#nodejs---s3-upload-with-aws-sdk-v3)
- [Presigned URLs](#presigned-urls)
- [Bucket Policy for Public Access](#bucket-policy-for-public-access)
- [CORS Configuration](#cors-configuration)

---

## Prerequisites

```bash
# Install AWS CLI
sudo apt install awscli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format
```

Required npm packages for Node.js:
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer
```

---

## AWS CLI - S3 Commands

```bash
# List all buckets
aws s3 ls

# Create a bucket
aws s3 mb s3://my-bucket-name --region ap-south-1

# Upload a file
aws s3 cp ./file.txt s3://my-bucket-name/

# Upload entire folder
aws s3 cp ./folder s3://my-bucket-name/folder --recursive

# Sync local folder with S3 (upload only changes)
aws s3 sync ./local-folder s3://my-bucket-name/remote-folder

# Download a file
aws s3 cp s3://my-bucket-name/file.txt ./file.txt

# Delete a file
aws s3 rm s3://my-bucket-name/file.txt

# Delete all files in bucket
aws s3 rm s3://my-bucket-name --recursive

# Delete a bucket (must be empty)
aws s3 rb s3://my-bucket-name
```

---

## Node.js - S3 Upload with AWS SDK v3

### S3 Client Setup

```javascript
// config/s3Client.js
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3Client;
```

### Upload File

```javascript
// utils/s3Upload.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3Client.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const uploadToS3 = async (file, folder = "uploads") => {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${uuidv4()}${ext}`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3Client.send(new PutObjectCommand(params));

  return {
    key,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
};
```

### Delete File

```javascript
// utils/s3Delete.js
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3Client.js";

export const deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  };

  await s3Client.send(new DeleteObjectCommand(params));
};
```

### Express Route Example

```javascript
import express from "express";
import multer from "multer";
import { uploadToS3 } from "../utils/s3Upload.js";
import { deleteFromS3 } from "../utils/s3Delete.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const result = await uploadToS3(req.file, "images");
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete
router.delete("/delete", async (req, res) => {
  try {
    await deleteFromS3(req.body.key);
    res.json({ success: true, message: "File deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

### Environment Variables

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name
```

---

## Presigned URLs

Generate temporary URLs for secure upload/download without exposing credentials.

```javascript
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3Client.js";

// Presigned URL for downloading (GET)
export const getPresignedDownloadUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

// Presigned URL for uploading (PUT)
export const getPresignedUploadUrl = async (key, contentType, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};
```

---

## Bucket Policy for Public Access

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/public/*"
    }
  ]
}
```

Note: Only make the `public/` prefix publicly readable. Keep other folders private.

---

## CORS Configuration

Set this in S3 Bucket > Permissions > CORS Configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
