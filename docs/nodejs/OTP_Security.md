# OTP Security — Middlewares & Controllers (Express.js)

> **Purpose:** Multi-layer OTP security system — rate limiting by IP, daily limits, phone number validation, per-phone DB-level limits, and a complete send-OTP controller factory.

---

## Table of Contents

1. [Install](#install)
2. [1 — IP Rate Limiter (3 per 10 min)](#1--ip-rate-limiter-3-per-10-min)
3. [2 — Daily OTP Limit per IP (10 per day)](#2--daily-otp-limit-per-ip-10-per-day)
4. [3 — Phone Number Validation](#3--phone-number-validation)
5. [4 — Per-Phone OTP Limit (DB Level)](#4--per-phone-otp-limit-db-level)
6. [5 — Send OTP Controller Factory](#5--send-otp-controller-factory)
7. [Full Route Setup](#full-route-setup)

---

## Install

```sh
npm install express-rate-limit
```

---

## 1 — IP Rate Limiter (3 per 10 min)

> First layer — limits how many OTP requests one IP can make in a short window.

```js
import rateLimit from "express-rate-limit";

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3,
    message: {
        success: false,
        message: "Too many OTP requests, please try again after 10 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
});
```

---

## 2 — Daily OTP Limit per IP (10 per day)

> Second layer — in-memory store counting OTPs per IP per day. Use Redis in production.

```js
const dailyOTPStore = new Map();

// Cleanup expired entries every hour
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
```

> **Production note:** Replace `Map` with Redis: `await redis.incr(key)` with a 24-hour TTL.

---

## 3 — Phone Number Validation

> Validates phone format before hitting the database. Supports Indian and international numbers.

```js
export const validatePhone = (req, res, next) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({
            success: false,
            message: "Phone number is required",
        });
    }

    // Remove spaces, dashes, and + prefix
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");

    const indianPhone        = /^[6-9]\d{9}$/;    // Indian: 10 digits starting with 6-9
    const internationalPhone = /^\d{10,15}$/;     // International: 10-15 digits

    if (!indianPhone.test(cleanPhone) && !internationalPhone.test(cleanPhone)) {
        return res.status(400).json({
            success: false,
            message: "Invalid phone number format",
        });
    }

    req.cleanPhone = cleanPhone; // Attach normalized phone for downstream use
    next();
};
```

---

## 4 — Per-Phone OTP Limit (DB Level)

> Queries the database to enforce minimum gap between OTPs, hourly limit, and daily limit per phone number.

```js
/**
 * @param {Model} OTPModel - Mongoose OTP model
 * @param {Object} options - Configuration
 */
export const checkPhoneOTPLimit = (OTPModel, options = {}) => {
    const {
        minGapSeconds = 60,   // Min seconds between consecutive OTPs
        maxPerHour    = 5,    // Max OTPs per hour per phone
        maxPerDay     = 10,   // Max OTPs per day per phone
        phoneField    = "phone",
    } = options;

    return async (req, res, next) => {
        try {
            const phone = req.cleanPhone || req.body.phone;

            // Check minimum gap
            const lastOTP = await OTPModel.findOne({ [phoneField]: phone })
                .sort({ createdAt: -1 });

            if (lastOTP) {
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
```

---

## 5 — Send OTP Controller Factory

> Creates a complete send-OTP controller. Accepts a Mongoose OTP model and an SMS-sending function.

```js
import generateOTP from "./generateOTP.js";

/**
 * @param {Model}    OTPModel  - Mongoose OTP model
 * @param {Function} sendSMS   - async (phone, message) => void
 * @param {Object}   options   - Configuration
 */
export const createSendOTPController = (OTPModel, sendSMS, options = {}) => {
    const {
        otpLength      = 6,
        expiryMinutes  = 10,
        phoneField     = "phone",
        appName        = "App",
    } = options;

    return async (req, res) => {
        try {
            const phone = req.cleanPhone || req.body.phone;

            const otp       = generateOTP(otpLength);
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            // Invalidate all previous unused OTPs for this phone
            await OTPModel.updateMany(
                { [phoneField]: phone, isUsed: false },
                { $set: { isUsed: true } }
            );

            // Save new OTP
            await OTPModel.create({ [phoneField]: phone, otp, expiresAt });

            // Send via SMS
            await sendSMS(phone, `Your ${appName} verification code is: ${otp}. Valid for ${expiryMinutes} minutes.`);

            res.status(200).json({
                success: true,
                message: "OTP sent successfully",
            });
        } catch (error) {
            console.error("Send OTP error:", error);
            res.status(500).json({ success: false, message: "Failed to send OTP" });
        }
    };
};
```

---

## Full Route Setup

```js
import express from "express";
import OTPModel from "../models/otp.model.js";
import {
    otpLimiter,
    dailyOTPLimiter,
    validatePhone,
    checkPhoneOTPLimit,
    createSendOTPController,
} from "./otpSecurity.js";

const router = express.Router();

// SMS sender function (replace with your SMS provider)
const sendSMS = async (phone, message) => {
    // e.g. await twilioClient.messages.create({ to: phone, body: message, from: "..." });
    console.log(`SMS to ${phone}: ${message}`);
};

const phoneOTPLimit = checkPhoneOTPLimit(OTPModel, {
    minGapSeconds: 60,
    maxPerHour: 5,
    maxPerDay: 10,
});

const sendOTP = createSendOTPController(OTPModel, sendSMS, {
    otpLength: 6,
    expiryMinutes: 10,
    appName: "MyApp",
});

// Middleware chain: IP limit → daily limit → phone validation → DB limit → send
router.post(
    "/send-otp",
    otpLimiter,       // 3 requests per 10 min (IP)
    dailyOTPLimiter,  // 10 per day (IP)
    validatePhone,    // Validate & normalize phone
    phoneOTPLimit,    // DB-level per-phone limits
    sendOTP           // Generate, save & send
);

export default router;
```

---

## Security Layer Summary

| Layer | Middleware | Limit |
|-------|-----------|-------|
| 1 | `otpLimiter` | 3 OTPs / 10 min per IP |
| 2 | `dailyOTPLimiter` | 10 OTPs / day per IP |
| 3 | `validatePhone` | Phone format validation |
| 4 | `checkPhoneOTPLimit` | 60s gap + 5/hr + 10/day per phone |
| 5 | `createSendOTPController` | Generate, save, send |
