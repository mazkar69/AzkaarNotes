# Protect Middleware — JWT Auth (Express.js)

> **Purpose:** Verifies a JWT Bearer token on protected routes. Attaches the authenticated user to `req.user` so downstream controllers can access it without another DB query.

---

## Install

```sh
npm install jsonwebtoken
```

---

## Code

```js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded._id).select("-password");

            if (req.user) {
                next();
            } else {
                res.status(401).json({ success: false, msg: "Unauthorized user" });
            }
        } catch (error) {
            res.status(401).json({ success: false, msg: "Unauthorized user" });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, msg: "Unauthorized user" });
    }
};

export default protect;
```

---

## How It Works

```
Request: Authorization: Bearer <token>
        ↓
Split "Bearer <token>" → extract token
        ↓
jwt.verify(token, JWT_SECRET) → decode payload (e.g. { _id: "..." })
        ↓
User.findById(decoded._id).select("-password")
        ↓
req.user = user document (without password)
        ↓
next() — proceed to controller
```

If the token is missing, invalid, or the user doesn't exist → `401 Unauthorized`.

---

## Generating a JWT (Login Controller)

```js
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign(
        { _id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Token valid for 7 days
    );
};

// In login controller:
const token = generateToken(user._id);
res.json({ success: true, token });
```

---

## Usage in Routes

```js
import express from "express";
import protect from "./protectMiddleware.js";
import { getProfile, updateProfile } from "./userController.js";

const router = express.Router();

// Public routes — no protect
router.post("/login",    loginController);
router.post("/register", registerController);

// Protected routes — require valid JWT
router.get("/profile",    protect, getProfile);
router.put("/profile",    protect, updateProfile);
router.delete("/account", protect, deleteAccount);
```

---

## Accessing `req.user` in Controllers

```js
export const getProfile = async (req, res) => {
    // req.user is the full user document (minus password)
    res.json({
        success: true,
        data: req.user,
    });
};

export const updateProfile = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name: req.body.name },
        { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
};
```

---

## Environment Variable

```env
JWT_SECRET=your_super_secret_key_here
```

> Use a long, random string (32+ characters). Never commit this to source control.

---

## Role-Based Access (Optional Extension)

```js
// Middleware to restrict to specific roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(" or ")}`,
            });
        }
        next();
    };
};

// Usage
router.delete("/users/:id", protect, authorize("admin"), deleteUser);
router.get("/dashboard",    protect, authorize("admin", "moderator"), getDashboard);
```

---

## Frontend — Sending the Token

```js
// Axios — set globally
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Axios — per request
axios.get("/api/profile", {
    headers: { Authorization: `Bearer ${token}` },
});

// Fetch
fetch("/api/profile", {
    headers: { Authorization: `Bearer ${token}` },
});
```

---

## Notes

- Token payload contains `_id` — always fetch the fresh user from DB (don't trust payload alone for roles/status)
- Use `.select("-password")` to never expose the password hash in `req.user`
- For refresh tokens, store them in httpOnly cookies — not in localStorage
- Always set a reasonable `expiresIn` — `"7d"` or `"1d"` is typical
