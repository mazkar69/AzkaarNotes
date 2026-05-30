# Async Handler — Express.js

> **Purpose:** Wraps async route handlers to automatically catch errors and pass them to Express error middleware — eliminates repetitive `try/catch` blocks in every controller.

---

## The Problem (Without asyncHandler)

```js
router.get("/users", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json({ success: true, data: users });
    } catch (error) {
        next(error); // Must manually call next(error) in every route
    }
});
```

Every route needs its own `try/catch`. This becomes repetitive and easy to forget.

---

## The Solution

```js
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
```

---

## Usage

```js
import asyncHandler from "./asyncHandler.js";

router.get("/users", asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json({ success: true, data: users });
    // No try/catch needed — errors are caught and forwarded to errorHandler
}));

router.post("/users", asyncHandler(async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
}));
```

---

## How It Works

1. `asyncHandler(fn)` returns a new function `(req, res, next) => ...`
2. That function calls your `async fn` and wraps it in `Promise.resolve()`
3. If the promise rejects, `.catch(next)` passes the error to Express's error middleware
4. Your global `errorHandler` middleware handles it from there

---

## Setup (app.js / server.js)

```js
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Routes
app.use("/api/users", userRoutes);

// Must be AFTER all routes
app.use(notFound);       // 404 handler
app.use(errorHandler);   // Global error handler
```

> `asyncHandler` only works properly when a global `errorHandler` middleware is registered at the end of the app.
