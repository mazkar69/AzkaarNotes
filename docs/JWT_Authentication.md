# JWT Authentication - Complete Guide

> Last Updated: February 22, 2026

## Table of Contents
- [How JWT Works](#how-jwt-works)
- [JWT Structure](#jwt-structure)
- [Setup](#setup)
- [Generate Tokens](#generate-tokens)
- [Verify and Protect Routes](#verify-and-protect-routes)
- [Refresh Token Flow](#refresh-token-flow)
- [Complete Auth Example](#complete-auth-example)
- [Best Practices](#best-practices)

---

## How JWT Works

```
1. User sends login credentials (email + password)
2. Server validates credentials
3. Server generates JWT (access token + refresh token)
4. Client stores tokens (httpOnly cookie or memory)
5. Client sends access token with each request (Authorization header)
6. Server verifies token and grants access
7. When access token expires, use refresh token to get a new one
```

---

## JWT Structure

A JWT has three parts separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.    <- Header (algorithm + type)
eyJ1c2VySWQiOiIxMjM0NSIsInJvbGUiOiJ1c2VyIn0.  <- Payload (data)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   <- Signature (verification)
```

| Part | Contains |
|------|----------|
| Header | Algorithm (HS256) and token type (JWT) |
| Payload | User data (id, role, expiry) - not encrypted, only encoded |
| Signature | Verification hash using secret key |

---

## Setup

```bash
npm install jsonwebtoken bcryptjs cookie-parser
```

```env
ACCESS_TOKEN_SECRET=your-access-token-secret-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

## Generate Tokens

```javascript
// utils/generateToken.js
import jwt from "jsonwebtoken";

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};
```

---

## Verify and Protect Routes

```javascript
// middleware/auth.js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    // Get token from header or cookie
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};
```

### Usage in Routes

```javascript
import { protect, authorize } from "../middleware/auth.js";

// Protected route
router.get("/profile", protect, getProfile);

// Admin only route
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
```

---

## Refresh Token Flow

```javascript
// controllers/authController.js

// Login - set both tokens
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ success: true, accessToken });
};

// Refresh - issue new access token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(decoded.userId);
    res.json({ success: true, accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// Logout - clear cookies
export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
};
```

---

## Complete Auth Example

### User Model

```javascript
// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
```

### Auth Routes

```javascript
// routes/authRoutes.js
import express from "express";
import { register, login, logout, refreshAccessToken, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshAccessToken);
router.get("/profile", protect, getProfile);

export default router;
```

---

## Best Practices

1. Keep access token expiry short (15 minutes)
2. Store refresh tokens in httpOnly secure cookies, not localStorage
3. Use a strong secret key (minimum 32 characters)
4. Never store sensitive data in the JWT payload (it is only base64 encoded, not encrypted)
5. Always validate tokens on the server side
6. Implement token blacklisting for logout (Redis is ideal for this)
7. Use HTTPS in production
8. Set `sameSite: "strict"` on cookies to prevent CSRF
9. Rotate refresh tokens on each use for extra security
10. Use different secrets for access and refresh tokens
