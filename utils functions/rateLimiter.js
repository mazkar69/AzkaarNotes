import rateLimit from "express-rate-limit";

// ============================================
// Basic Rate Limiter
// ============================================

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests, please try again after 15 minutes",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// ============================================
// Auth Routes Rate Limiter (Strict)
// ============================================

/**
 * Strict limiter for auth routes (login, register, forgot password)
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 attempts per window
    message: {
        success: false,
        message: "Too many login attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

// ============================================
// OTP/Verification Rate Limiter
// ============================================

/**
 * OTP sending limiter
 * 3 OTP requests per 10 minutes
 */
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 3,
    message: {
        success: false,
        message: "Too many OTP requests, please try again after 10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// File Upload Rate Limiter
// ============================================

/**
 * File upload limiter
 * 10 uploads per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10,
    message: {
        success: false,
        message: "Upload limit reached, please try again after an hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// Custom Rate Limiter Factory
// ============================================

/**
 * Create custom rate limiter
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
export const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000,
        limit = 100,
        message = "Too many requests, please try again later",
        skipSuccessfulRequests = false,
        skipFailedRequests = false,
        keyGenerator = null,
    } = options;

    return rateLimit({
        windowMs,
        limit,
        message: {
            success: false,
            message,
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skipFailedRequests,
        keyGenerator: keyGenerator || ((req) => req.ip),
    });
};

// ============================================
// Rate Limiter by User ID (for authenticated routes)
// ============================================

/**
 * User-based rate limiter (requires auth middleware first)
 */
export const userBasedLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        success: false,
        message: "Rate limit exceeded",
    },
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise fall back to IP
        return req.user?._id?.toString() || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// Slow Down Middleware (Alternative to blocking)
// ============================================
/*
import slowDown from "express-slow-down";

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window without delay
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after limit
  maxDelayMs: 5000, // Max 5 second delay
});
*/

// ============================================
// Usage Examples
// ============================================
/*
import express from "express";
import { apiLimiter, authLimiter, otpLimiter, createRateLimiter } from "./rateLimiter.js";

const app = express();

// Apply to all API routes
app.use("/api", apiLimiter);

// Apply strict limiter to auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// Apply OTP limiter
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);

// Custom limiter for specific route
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: "Too many search requests",
});

app.use("/api/search", searchLimiter);

// Route-specific usage
import { Router } from "express";
const router = Router();

router.post("/login", authLimiter, loginController);
router.post("/register", authLimiter, registerController);
*/

// ============================================
// Install Required Package
// ============================================
/*
npm install express-rate-limit

# Optional for slow down
npm install express-slow-down
*/
