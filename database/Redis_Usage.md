# Redis - Usage Patterns and Commands

> Last Updated: February 22, 2026

## Table of Contents
- [Overview](#overview)
- [Installation](#installation)
- [Basic Commands](#basic-commands)
- [Data Types](#data-types)
- [Node.js Integration](#nodejs-integration)
- [Caching Patterns](#caching-patterns)
- [Session Storage](#session-storage)
- [Rate Limiting with Redis](#rate-limiting-with-redis)
- [Pub/Sub](#pubsub)
- [Useful Commands](#useful-commands)

---

## Overview

Redis is an in-memory key-value data store used for caching, session management, rate limiting, queues, and real-time messaging.

| Feature | Description |
|---------|-------------|
| Speed | Sub-millisecond reads/writes |
| Persistence | Optional disk persistence (RDB/AOF) |
| Data Types | Strings, Lists, Sets, Hashes, Sorted Sets |
| TTL | Built-in key expiration |
| Pub/Sub | Message broadcasting |

---

## Installation

### Ubuntu

```bash
sudo apt update
sudo apt install redis-server

# Start and enable
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
# Output: PONG
```

### Docker

```bash
docker run -d --name redis -p 6379:6379 redis:alpine

# With password
docker run -d --name redis -p 6379:6379 redis:alpine --requirepass yourpassword
```

---

## Basic Commands

```bash
# Access Redis CLI
redis-cli

# If password protected
redis-cli -a yourpassword

# SET and GET
SET name "John"
GET name

# SET with expiry (seconds)
SET token "abc123" EX 3600

# SET with expiry (milliseconds)
SET token "abc123" PX 60000

# Check TTL (time to live)
TTL name          # in seconds
PTTL name         # in milliseconds

# Delete a key
DEL name

# Check if key exists
EXISTS name

# Set expiry on existing key
EXPIRE name 60

# Remove expiry
PERSIST name

# Get all keys matching pattern
KEYS user:*

# Flush all data
FLUSHDB           # current database
FLUSHALL          # all databases
```

---

## Data Types

### Strings

```bash
SET count 10
INCR count              # 11
INCRBY count 5          # 16
DECR count              # 15
APPEND name " Doe"      # "John Doe"
STRLEN name             # 8
```

### Hashes (Objects)

```bash
HSET user:1 name "John" email "john@example.com" age "25"
HGET user:1 name                  # "John"
HGETALL user:1                    # all fields and values
HDEL user:1 age                   # delete a field
HEXISTS user:1 email              # 1 (true)
HINCRBY user:1 age 1              # increment numeric field
```

### Lists

```bash
LPUSH queue "task1"               # push to left
RPUSH queue "task2"               # push to right
LPOP queue                        # pop from left
RPOP queue                        # pop from right
LRANGE queue 0 -1                 # get all items
LLEN queue                        # length
```

### Sets (Unique Values)

```bash
SADD tags "nodejs" "express" "mongodb"
SMEMBERS tags                     # all members
SISMEMBER tags "nodejs"           # 1 (true)
SREM tags "express"               # remove member
SCARD tags                        # count
```

### Sorted Sets

```bash
ZADD leaderboard 100 "player1" 200 "player2" 150 "player3"
ZRANGE leaderboard 0 -1 WITHSCORES       # ascending
ZREVRANGE leaderboard 0 -1 WITHSCORES    # descending
ZSCORE leaderboard "player1"              # get score
ZINCRBY leaderboard 50 "player1"          # increment score
ZRANK leaderboard "player1"              # rank (0-indexed)
```

---

## Node.js Integration

### Setup

```bash
npm install redis
```

```javascript
// config/redis.js
import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // password: process.env.REDIS_PASSWORD,
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis connected"));

await redisClient.connect();

export default redisClient;
```

### Basic Operations

```javascript
import redisClient from "../config/redis.js";

// String
await redisClient.set("key", "value");
await redisClient.set("key", "value", { EX: 3600 }); // with 1 hour expiry
const value = await redisClient.get("key");

// Hash
await redisClient.hSet("user:1", { name: "John", email: "john@example.com" });
const user = await redisClient.hGetAll("user:1");

// Delete
await redisClient.del("key");

// Check existence
const exists = await redisClient.exists("key");
```

---

## Caching Patterns

### Cache-Aside (Lazy Loading)

Most common pattern. Check cache first, if miss, fetch from DB and store in cache.

```javascript
export const getUser = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `user:${id}`;

  // Check cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.json({ success: true, data: JSON.parse(cached), source: "cache" });
  }

  // Cache miss - fetch from database
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Store in cache (expire in 1 hour)
  await redisClient.set(cacheKey, JSON.stringify(user), { EX: 3600 });

  res.json({ success: true, data: user, source: "database" });
};
```

### Cache Invalidation

Clear cache when data changes.

```javascript
export const updateUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(id, req.body, { new: true });

  // Invalidate cache
  await redisClient.del(`user:${id}`);

  res.json({ success: true, data: user });
};
```

### Reusable Cache Middleware

```javascript
// middleware/cache.js
export const cacheMiddleware = (keyPrefix, ttl = 3600) => {
  return async (req, res, next) => {
    const key = `${keyPrefix}:${req.originalUrl}`;

    const cached = await redisClient.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      await redisClient.set(key, JSON.stringify(data), { EX: ttl });
      return originalJson(data);
    };

    next();
  };
};

// Usage in routes
router.get("/products", cacheMiddleware("products", 600), getProducts);
```

---

## Session Storage

```bash
npm install express-session connect-redis
```

```javascript
import session from "express-session";
import RedisStore from "connect-redis";
import redisClient from "./config/redis.js";

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);
```

---

## Rate Limiting with Redis

```javascript
// middleware/rateLimiter.js
import redisClient from "../config/redis.js";

export const rateLimiter = (maxRequests = 100, windowMs = 15 * 60) => {
  return async (req, res, next) => {
    const key = `ratelimit:${req.ip}`;

    const current = await redisClient.incr(key);

    if (current === 1) {
      await redisClient.expire(key, windowMs);
    }

    if (current > maxRequests) {
      const ttl = await redisClient.ttl(key);
      return res.status(429).json({
        success: false,
        message: "Too many requests",
        retryAfter: ttl,
      });
    }

    res.set("X-RateLimit-Limit", maxRequests);
    res.set("X-RateLimit-Remaining", maxRequests - current);

    next();
  };
};

// Usage
app.use("/api", rateLimiter(100, 900)); // 100 requests per 15 minutes
```

---

## Pub/Sub

Publish-subscribe messaging pattern.

```javascript
// Publisher
import { createClient } from "redis";
const publisher = createClient();
await publisher.connect();

await publisher.publish("notifications", JSON.stringify({
  userId: "123",
  message: "New order received",
}));

// Subscriber
const subscriber = createClient();
await subscriber.connect();

await subscriber.subscribe("notifications", (message) => {
  const data = JSON.parse(message);
  console.log("Received:", data);
});
```

---

## Useful Commands

```bash
# Monitor all Redis commands in real-time
redis-cli MONITOR

# Get server info
redis-cli INFO

# Get memory usage
redis-cli INFO memory

# Get number of keys
redis-cli DBSIZE

# Scan keys (production-safe alternative to KEYS)
redis-cli SCAN 0 MATCH user:* COUNT 100

# Check Redis version
redis-cli INFO server | grep redis_version
```
