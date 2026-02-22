/**
 * Async Handler Wrapper for Express Routes
 *
 * Wraps async route handlers to catch errors and pass them
 * to Express error handling middleware automatically.
 * Eliminates the need for try-catch blocks in every controller.
 *
 * Usage:
 *   import asyncHandler from "./asyncHandler.js";
 *
 *   router.get("/users", asyncHandler(async (req, res) => {
 *     const users = await User.find();
 *     res.json({ success: true, data: users });
 *   }));
 *
 * Without asyncHandler:
 *   router.get("/users", async (req, res, next) => {
 *     try {
 *       const users = await User.find();
 *       res.json({ success: true, data: users });
 *     } catch (error) {
 *       next(error);
 *     }
 *   });
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
