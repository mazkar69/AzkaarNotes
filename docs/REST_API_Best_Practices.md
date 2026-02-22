# REST API Best Practices

> Last Updated: February 22, 2026

## Table of Contents
- [URL Structure](#url-structure)
- [HTTP Methods](#http-methods)
- [Status Codes](#status-codes)
- [Request and Response Format](#request-and-response-format)
- [Pagination](#pagination)
- [Filtering, Sorting and Searching](#filtering-sorting-and-searching)
- [Error Handling](#error-handling)
- [Versioning](#versioning)
- [Security](#security)
- [Project Structure](#project-structure)

---

## URL Structure

### Rules

- Use nouns, not verbs
- Use plural names
- Use lowercase and hyphens
- Nest resources logically

### Examples

```
Good:
  GET    /api/v1/users
  GET    /api/v1/users/123
  POST   /api/v1/users
  PUT    /api/v1/users/123
  DELETE /api/v1/users/123
  GET    /api/v1/users/123/orders
  GET    /api/v1/users/123/orders/456

Bad:
  GET    /api/v1/getUsers
  POST   /api/v1/createUser
  DELETE /api/v1/deleteUser/123
  GET    /api/v1/user_list
```

---

## HTTP Methods

| Method | Purpose | Idempotent | Request Body |
|--------|---------|------------|-------------|
| GET | Retrieve resource(s) | Yes | No |
| POST | Create a new resource | No | Yes |
| PUT | Replace entire resource | Yes | Yes |
| PATCH | Partially update resource | Yes | Yes |
| DELETE | Remove a resource | Yes | No |

---

## Status Codes

### Success

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | GET, PUT, PATCH successful |
| 201 | Created | POST successful, resource created |
| 204 | No Content | DELETE successful, no body returned |

### Client Errors

| Code | Meaning | When to Use |
|------|---------|-------------|
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email already exists) |
| 422 | Unprocessable Entity | Valid syntax but semantically wrong |
| 429 | Too Many Requests | Rate limit exceeded |

### Server Errors

| Code | Meaning | When to Use |
|------|---------|-------------|
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Upstream server error |
| 503 | Service Unavailable | Server temporarily down |

---

## Request and Response Format

### Successful Response

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### List Response with Pagination

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    { "id": "1", "name": "John" },
    { "id": "2", "name": "Jane" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalDocs": 50
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

## Pagination

### Query Parameters

```
GET /api/v1/users?page=2&limit=10
```

### Implementation

```javascript
export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, totalDocs] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    },
  });
};
```

---

## Filtering, Sorting and Searching

### Query Parameters

```
GET /api/v1/products?category=electronics&minPrice=100&maxPrice=500
GET /api/v1/products?sort=-price,name
GET /api/v1/products?search=laptop
GET /api/v1/products?fields=name,price,category
```

### Implementation

```javascript
export const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, sort, search, fields } = req.query;

  // Build filter
  const filter = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Build sort
  let sortBy = { createdAt: -1 };
  if (sort) {
    sortBy = {};
    sort.split(",").forEach((field) => {
      if (field.startsWith("-")) {
        sortBy[field.slice(1)] = -1;
      } else {
        sortBy[field] = 1;
      }
    });
  }

  // Build field selection
  let select = "";
  if (fields) {
    select = fields.split(",").join(" ");
  }

  const products = await Product.find(filter).sort(sortBy).select(select);
  res.json({ success: true, data: products });
};
```

---

## Error Handling

### Async Handler Wrapper

```javascript
// middleware/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
```

### Custom Error Class

```javascript
// utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}

export default ApiError;
```

### Global Error Middleware

```javascript
// middleware/errorMiddleware.js
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

export default errorMiddleware;
```

### Usage

```javascript
import asyncHandler from "../middleware/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.json({ success: true, data: user });
});
```

---

## Versioning

### URL Versioning (recommended)

```
/api/v1/users
/api/v2/users
```

### Implementation

```javascript
import v1Routes from "./routes/v1/index.js";
import v2Routes from "./routes/v2/index.js";

app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
```

---

## Security

| Practice | Implementation |
|----------|---------------|
| Rate Limiting | `express-rate-limit` package |
| Helmet | `helmet` package - sets security headers |
| CORS | `cors` package - restrict origins |
| Input Sanitization | `express-mongo-sanitize`, `xss-clean` |
| Parameter Pollution | `hpp` package |
| Body Size Limit | `express.json({ limit: "10kb" })` |

```javascript
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
```

---

## Project Structure

```
src/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   └── userController.js
├── middleware/
│   ├── auth.js
│   ├── asyncHandler.js
│   └── errorMiddleware.js
├── models/
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── ApiError.js
│   └── generateToken.js
├── validators/
│   └── userValidator.js
├── app.js
└── server.js
```
