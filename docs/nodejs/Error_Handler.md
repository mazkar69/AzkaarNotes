# Error Handler Middleware — Express.js

> **Purpose:** Centralized global error handling for Express apps. Catches all errors thrown or passed via `next(error)` and returns a consistent JSON response.

---

## Table of Contents

1. [Code](#code)
2. [Register in App](#register-in-app)
3. [How Errors Flow](#how-errors-flow)
4. [Throwing Errors in Controllers](#throwing-errors-in-controllers)
5. [Custom Error Class (Optional)](#custom-error-class-optional)

---

## Code

```js
// Global error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};

// 404 Not Found middleware
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export { errorHandler, notFound };
```

---

## Register in App

```js
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// All routes go here
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Must be AFTER all routes
app.use(notFound);     // Catches undefined routes → 404
app.use(errorHandler); // Catches all errors → JSON response
```

> Order matters — `notFound` and `errorHandler` must be the **last** middleware.

---

## How Errors Flow

```
Controller throws error
        ↓
asyncHandler catches it → calls next(error)
        ↓
errorHandler middleware receives it
        ↓
Returns JSON: { success: false, message: "...", stack: "..." }
```

---

## Throwing Errors in Controllers

### With asyncHandler

```js
import asyncHandler from "./asyncHandler.js";

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found"); // Caught by asyncHandler → errorHandler
    }

    res.json({ success: true, data: user });
});
```

### Manually (without asyncHandler)

```js
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404);
            return next(new Error("User not found"));
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};
```

---

## Custom Error Class (Optional)

> Adds a `statusCode` property directly on the error for cleaner controller code.

```js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Updated errorHandler to read statusCode from error
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
```

**Usage with AppError:**

```js
import asyncHandler from "./asyncHandler.js";
import AppError from "./AppError.js";

export const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new AppError("User not found", 404); // No need to set res.status()
    }

    res.json({ success: true, data: user });
});
```

---

## Response Shape

**Development:**
```json
{
  "success": false,
  "message": "User not found",
  "stack": "Error: User not found\n    at ..."
}
```

**Production** (`NODE_ENV=production`):
```json
{
  "success": false,
  "message": "User not found",
  "stack": null
}
```
