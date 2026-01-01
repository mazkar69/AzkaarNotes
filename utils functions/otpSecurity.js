import rateLimit from "express-rate-limit";

// ============================================
// 1. IP-Based Rate Limiter (3 per 10 min)
// ============================================

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests, please try again after 10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip, // Rate limit by IP
});

// ============================================
// 2. Daily OTP Limit per IP (10 per day)
// ============================================

// In-memory store (Use Redis in production)
const dailyOTPStore = new Map();

// Clean up expired entries every hour
setInterval(() => {
    const today = new Date().toDateString();
    for (const [key] of dailyOTPStore) {
        if (!key.includes(today)) {
            dailyOTPStore.delete(key);
        }
    }
}, 60 * 60 * 1000);

export const dailyOTPLimiter = (req, res, next) => {
    const today = new Date().toDateString();
    const key = `${req.ip}-${today}`;

    const count = dailyOTPStore.get(key) || 0;

    if (count >= 10) {
        return res.status(429).json({
            success: false,
            message: "Daily OTP limit exceeded. Try again tomorrow.",
        });
    }

    dailyOTPStore.set(key, count + 1);
    next();
};

// ============================================
// 3. Phone Number Validation
// ============================================

export const validatePhone = (req, res, next) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required",
        });
    }

    // Remove spaces, dashes, and + prefix for validation
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");

    // Indian phone: 10 digits starting with 6-9
    const indianPhone = /^[6-9]\d{9}$/;

    // International: 10-15 digits
    const internationalPhone = /^\d{10,15}$/;

    if (!indianPhone.test(cleanPhone) && !internationalPhone.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number format",
        });
    }

    // Attach cleaned phone to request
    req.cleanPhone = cleanPhone;
    next();
};

// ============================================
// 4. Per-Phone OTP Limit (Database Level)
// ============================================

/**
 * Check if phone has exceeded OTP limits
 * @param {Object} OTPModel - Mongoose OTP model
 * @param {Object} options - Configuration options
 */
export const checkPhoneOTPLimit = (OTPModel, options = {}) => {
    const {
        minGapSeconds = 60,        // Minimum gap between OTPs (seconds)
        maxPerHour = 5,            // Max OTPs per hour
        maxPerDay = 10,            // Max OTPs per day
        phoneField = "phone",      // Field name in OTP model
    } = options;

    return async (req, res, next) => {
        try {
            const phone = req.cleanPhone || req.body.phone;

            // Get last OTP for this phone
            const lastOTP = await OTPModel.findOne({ [phoneField]: phone })
                .sort({ createdAt: -1 });

            if (lastOTP) {
                // Check minimum gap (prevent rapid requests)
                const timeDiffSeconds = (Date.now() - lastOTP.createdAt) / 1000;

                if (timeDiffSeconds < minGapSeconds) {
                    const waitTime = Math.ceil(minGapSeconds - timeDiffSeconds);
                    return res.status(429).json({
                        success: false,
                        message: `Please wait ${waitTime} seconds before requesting new OTP`,
                        retryAfter: waitTime,
                    });
                }
            }

            // Check hourly limit
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const hourlyCount = await OTPModel.countDocuments({
                [phoneField]: phone,
                createdAt: { $gte: oneHourAgo },
            });

            if (hourlyCount >= maxPerHour) {
                return res.status(429).json({
                    success: false,
                    message: `OTP limit reached. Maximum ${maxPerHour} OTPs per hour.`,
                });
            }

            // Check daily limit
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const dailyCount = await OTPModel.countDocuments({
                [phoneField]: phone,
                createdAt: { $gte: todayStart },
            });

            if (dailyCount >= maxPerDay) {
                return res.status(429).json({
                    success: false,
                    message: `Daily OTP limit reached. Try again tomorrow.`,
                });
            }

            next();
        } catch (error) {
            console.error("OTP limit check error:", error);
            next(error);
        }
    };
};

// ============================================
// 5. Send OTP Controller
// ============================================

/**
 * Generate and send OTP
 * @param {Object} OTPModel - Mongoose OTP model
 * @param {Function} sendSMS - SMS sending function (phone, message) => Promise
 * @param {Object} options - Configuration options
 */
export const createSendOTPController = (OTPModel, sendSMS, options = {}) => {
    const {
        otpLength = 6,
        expiryMinutes = 10,
        phoneField = "phone",
        appName = "App",
    } = options;

    return async (req, res) => {
        try {
            const phone = req.cleanPhone || req.body.phone;

            // Generate OTP
            const otp = generateOTP(otpLength);
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            // Invalidate previous OTPs for this phone
            await OTPModel.updateMany(
                { [phoneField]: phone, isUsed: false },
                { $set: { isUsed: true } }
            );

            // Save new OTP
            await OTPModel.create({
                [phoneField]: phone,
                otp,
                expiresAt,
                isUsed: false,
            });

            // Send SMS
            const message = `Your ${appName} verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share with anyone.`;

            await sendSMS(phone, message);

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                expiresIn: expiryMinutes * 60, // seconds
            });
        } catch (error) {
            console.error("Send OTP error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP. Please try again.",
            });
        }
    };
};

// ============================================
// 6. Verify OTP Controller
// ============================================

/**
 * Verify OTP
 * @param {Object} OTPModel - Mongoose OTP model
 * @param {Object} options - Configuration options
 */
export const createVerifyOTPController = (OTPModel, options = {}) => {
    const {
        maxAttempts = 5,
        phoneField = "phone",
    } = options;

    return async (req, res) => {
        try {
            const { phone, otp } = req.body;
            const cleanPhone = phone?.replace(/[\s\-\+]/g, "");

            if (!cleanPhone || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "Phone and OTP are required",
                });
            }

            // Find valid OTP
            const otpRecord = await OTPModel.findOne({
                [phoneField]: cleanPhone,
                isUsed: false,
                expiresAt: { $gt: new Date() },
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: "OTP expired or not found. Request a new one.",
                });
            }

            // Check attempts
            if (otpRecord.attempts >= maxAttempts) {
                await OTPModel.updateOne(
                    { _id: otpRecord._id },
                    { $set: { isUsed: true } }
                );
                return res.status(429).json({
                    success: false,
                    message: "Too many wrong attempts. Request a new OTP.",
                });
            }

            // Verify OTP
            if (otpRecord.otp !== otp) {
                await OTPModel.updateOne(
                    { _id: otpRecord._id },
                    { $inc: { attempts: 1 } }
                );
                const remainingAttempts = maxAttempts - otpRecord.attempts - 1;
                return res.status(400).json({
                    success: false,
                    message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
                });
            }

            // Mark as used
            await OTPModel.updateOne(
                { _id: otpRecord._id },
                { $set: { isUsed: true, verifiedAt: new Date() } }
            );

            return res.status(200).json({
                success: true,
                message: "OTP verified successfully",
            });
        } catch (error) {
            console.error("Verify OTP error:", error);
            return res.status(500).json({
                success: false,
                message: "Verification failed. Please try again.",
            });
        }
    };
};

// ============================================
// Helper: Generate OTP
// ============================================

const generateOTP = (length = 6) => {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

// ============================================
// OTP Model Schema (Reference)
// ============================================

/**
 * Mongoose Schema for OTP (for reference)
 *
 * const otpSchema = new mongoose.Schema({
 *     phone: { type: String, required: true, index: true },
 *     otp: { type: String, required: true },
 *     expiresAt: { type: Date, required: true },
 *     isUsed: { type: Boolean, default: false },
 *     attempts: { type: Number, default: 0 },
 *     verifiedAt: { type: Date },
 * }, { timestamps: true });
 *
 * // Auto-delete expired OTPs after 1 day
 * otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });
 *
 * export default mongoose.model('OTP', otpSchema);
 */

// ============================================
// Usage Example
// ============================================

/**
 * // routes/auth.js
 * import express from 'express';
 * import OTP from '../models/OTP.js';
 * import { sendSMS } from '../services/sms.js';
 * import {
 *     otpLimiter,
 *     dailyOTPLimiter,
 *     validatePhone,
 *     checkPhoneOTPLimit,
 *     createSendOTPController,
 *     createVerifyOTPController,
 * } from '../utils/otpSecurity.js';
 * 
 * const router = express.Router();
 * 
 * // Apply all middleware in sequence
 * router.post('/send-otp',
 *     otpLimiter,                           // 3 requests per 10 min per IP
 *     dailyOTPLimiter,                      // 10 requests per day per IP
 *     validatePhone,                         // Validate phone format
 *     checkPhoneOTPLimit(OTP, {             // DB-level per-phone limits
 *         minGapSeconds: 60,
 *         maxPerHour: 5,
 *         maxPerDay: 10,
 *     }),
 *     createSendOTPController(OTP, sendSMS, { // Send OTP
 *         otpLength: 6,
 *         expiryMinutes: 10,
 *         appName: 'MyApp',
 *     })
 * );
 * 
 * router.post('/verify-otp', 
 *     otpLimiter,
 *     createVerifyOTPController(OTP, { maxAttempts: 5 })
 * );
 * 
 * export default router;
 */