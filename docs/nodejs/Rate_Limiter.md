# Rate Limiter in Express.js

> **Package:** `express-rate-limit`
> **Purpose:** Limit repeated requests to APIs — protects against brute-force attacks, spam, and DoS.

---

## Table of Contents

1. [Install](#install)
2. [Proxy Setup (Critical)](#proxy-setup-critical)
3. [Basic Limiters](#basic-limiters)
4. [Auth Limiter (Strict)](#auth-limiter-strict)
5. [OTP Limiter](#otp-limiter)
6. [Upload Limiter](#upload-limiter)
7. [Custom Limiter with keyGenerator (IP-based)](#custom-limiter-with-keygenerator-ip-based)
8. [Custom Limiter Factory](#custom-limiter-factory)
9. [User-Based Limiter (Authenticated Routes)](#user-based-limiter-authenticated-routes)
10. [Slow Down Middleware (Alternative)](#slow-down-middleware-alternative)
11. [Usage Examples](#usage-examples)

---

## Install

```sh
npm install express-rate-limit

# Optional: for slow-down instead of blocking
npm install express-slow-down
```

---

## Proxy Setup (Critical)

> Without this setup, **ALL users share the same IP (`127.0.0.1`)** behind Nginx — one user's requests will block everyone else.

### 1. Express App (`app.js` / `server.js`)

```js
// Trust the first proxy (Nginx) so req.ip is the real client IP
app.set('trust proxy', 1);
```

### 2. Nginx Config (inside `location` block)

```nginx
location / {
    proxy_pass http://localhost:4001;

    # These two lines are REQUIRED — without them req.ip is always 127.0.0.1
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP      $remote_addr;

    proxy_set_header Host              $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### 3. Test & Reload Nginx

```sh
sudo nginx -t && sudo systemctl reload nginx
```

---

## Basic Limiters

```js
import rateLimit from "express-rate-limit";
```

### General API Limiter

> 100 requests per 15 minutes per IP

```js
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        success: false,
        message: "Too many requests, please try again after 15 minutes",
    },
    standardHeaders: true,  // Return rate limit info in headers
    legacyHeaders: false,
});
```

---

## Auth Limiter (Strict)

> 5 requests per 15 minutes — for login, register, forgot password

```js
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: {
        success: false,
        message: "Too many login attempts, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});
```

---

## OTP Limiter

> 3 OTP requests per 10 minutes

```js
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
```

---

## Upload Limiter

> 10 uploads per hour

```js
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
```

---

## Custom Limiter with keyGenerator (IP-based)

> Use when you need to debug IPs or normalize the key (e.g. strip IPv6 prefix `::ffff:`).
> Helpful to log `req.ip` vs `x-forwarded-for` to verify proxy setup is working.

```js
const ipKeyGenerator = (ip) => {
    // Normalize IPv4-mapped IPv6 addresses (e.g. ::ffff:192.168.1.1 → 192.168.1.1)
    return ip?.replace(/^::ffff:/, "") || "unknown";
};

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 10,
    keyGenerator: (req) => {
        const ip = req.ip;
        // console.log('[RateLimit] ip:', ip, '| x-forwarded-for:', req.headers['x-forwarded-for']);
        return ipKeyGenerator(ip);
    },
    standardHeaders: true,
    legacyHeaders: false,
});
```

> **Debug tip:** Uncomment the `console.log` line to verify that `req.ip` is the real client IP and not `127.0.0.1`. Once confirmed, remove it.

---

## Custom Limiter Factory

> Reusable helper to create a limiter with custom options for any route.

```js
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
```

---

## User-Based Limiter (Authenticated Routes)

> Limits by **user ID** instead of IP — useful for authenticated routes where multiple users may share an IP (e.g. corporate NAT, VPN).
> Requires auth middleware to run before this limiter.

```js
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
```

---

## Slow Down Middleware (Alternative)

> Instead of blocking requests, **add increasing delay** after a threshold. Better UX in some cases.

```js
import slowDown from "express-slow-down";

export const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50,            // Allow 50 requests per window without delay
    delayMs: (hits) => hits * 100, // Add 100ms delay per request after limit
    maxDelayMs: 5000,          // Max 5 second delay
});
```

---

## Usage Examples

```js
import express from "express";
import {
    apiLimiter,
    authLimiter,
    otpLimiter,
    uploadLimiter,
    userBasedLimiter,
    createRateLimiter,
} from "./rateLimiter.js";

const app = express();

// Trust Nginx proxy — MUST be set before any limiter is used
app.set('trust proxy', 1);

// Apply to all API routes
app.use("/api", apiLimiter);

// Strict limiter for auth routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

// OTP limiter
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/resend-otp", otpLimiter);

// Upload limiter
app.use("/api/upload", uploadLimiter);

// Custom limiter for a specific route
const searchLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limit: 30,
    message: "Too many search requests",
});
app.use("/api/search", searchLimiter);

// Route-level usage
import { Router } from "express";
const router = Router();

router.post("/login", authLimiter, loginController);
router.post("/register", authLimiter, registerController);
```

---

## Key Options Reference

| Option | Description |
|--------|-------------|
| `windowMs` | Time window in milliseconds |
| `limit` | Max requests per window per key |
| `message` | Response sent when limit is exceeded |
| `standardHeaders` | Send `RateLimit-*` headers (recommended: `true`) |
| `legacyHeaders` | Send old `X-RateLimit-*` headers (recommended: `false`) |
| `skipSuccessfulRequests` | Don't count `2xx` responses against the limit |
| `skipFailedRequests` | Don't count failed responses against the limit |
| `keyGenerator` | Function to generate the rate limit key (default: `req.ip`) |
