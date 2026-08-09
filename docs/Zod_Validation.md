# Zod Validation — Complete Beginner Guide

> Last Updated: August 8, 2026

## Table of Contents
- [What is Zod?](#what-is-zod)
- [Why Use Zod?](#why-use-zod)
- [Installation](#installation)
- [Core Concepts (Must Know)](#core-concepts-must-know)
- [Basic Schema Types](#basic-schema-types)
- [Object Schemas](#object-schemas)
- [Common Validation Methods](#common-validation-methods)
- [Parsing Data — parse vs safeParse](#parsing-data--parse-vs-safeparse)
- [Error Handling & Custom Messages](#error-handling--custom-messages)
- [Advanced Features](#advanced-features)
- [Zod in React Frontend](#zod-in-react-frontend)
- [Zod in Express Backend](#zod-in-express-backend)
- [Sharing Schemas Between Frontend & Backend](#sharing-schemas-between-frontend--backend)
- [Quick Reference Cheatsheet](#quick-reference-cheatsheet)

---

## What is Zod?

**Zod** is a JavaScript/TypeScript library for **validating data**. It lets you define a "shape" (called a **schema**) that your data must follow, and then checks any incoming data against that shape.

Think of it like a **security guard** for your data:

```
User fills a form  →  Zod checks the data  →  ✅ Valid → use it
                                             →  ❌ Invalid → show errors
```

**Real-life example:** When a user signs up, you want to make sure:
- Email is actually an email
- Password is at least 8 characters
- Age is a number and 18+

Instead of writing messy `if` conditions everywhere, you write **one schema** and Zod does all the checking.

---

## Why Use Zod?

| Without Zod 😫 | With Zod 😎 |
|----------------|-------------|
| Manual `if` checks for every field | One schema validates everything |
| Different validation on frontend & backend | Share the SAME schema in both places |
| Ugly, unclear error messages | Clean, structured error messages |
| No type safety | Auto TypeScript types from schema |

---

## Installation

```sh
Syntax:- npm install zod
Example:- npm install zod
```

For React forms (optional but recommended):

```sh
npm install react-hook-form @hookform/resolvers zod
```

---

## Core Concepts (Must Know)

There are only **3 steps** to using Zod. Learn these and you know 80% of Zod:

```javascript
import { z } from "zod";

// STEP 1: Define a schema (the rules)
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// STEP 2: Parse (validate) your data
const result = userSchema.safeParse({ name: "Azkar", age: 25 });

// STEP 3: Check the result
if (result.success) {
  console.log(result.data);   // ✅ validated data
} else {
  console.log(result.error);  // ❌ list of errors
}
```

That's it. **Schema → Parse → Result.** Everything else is just variations of this.

---

## Basic Schema Types

```javascript
import { z } from "zod";

z.string()          // must be a string
z.number()          // must be a number
z.boolean()         // must be true/false
z.date()            // must be a Date object
z.array(z.string()) // must be an array of strings
z.any()             // allows anything (avoid if possible)

// Special string formats (built-in validators)
z.string().email()      // must be a valid email
z.string().url()        // must be a valid URL
z.string().uuid()       // must be a valid UUID
z.string().min(3)       // minimum 3 characters
z.string().max(20)      // maximum 20 characters

// Number validators
z.number().min(18)      // minimum value 18
z.number().max(100)     // maximum value 100
z.number().int()        // must be an integer
z.number().positive()   // must be > 0
```

### Optional, Nullable & Default Values

```javascript
z.string().optional()              // can be undefined (field not required)
z.string().nullable()              // can be null
z.string().nullish()               // can be null OR undefined
z.string().default("Guest")        // if not provided, uses "Guest"

// Example
const schema = z.object({
  name: z.string(),                          // required
  nickname: z.string().optional(),           // optional
  role: z.string().default("user"),          // defaults to "user"
});

schema.parse({ name: "Azkar" });
// Result: { name: "Azkar", role: "user" }  ← role auto-filled!
```

---

## Object Schemas

Objects are the most common use case (forms, API bodies).

```javascript
const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().min(18),
  isAdmin: z.boolean().optional(),
});

// ✅ Valid
signupSchema.safeParse({
  username: "azkar",
  email: "azkar@example.com",
  password: "secret123",
  age: 25,
});

// ❌ Invalid — age too low, bad email
signupSchema.safeParse({
  username: "azkar",
  email: "not-an-email",
  password: "secret123",
  age: 15,
});
```

### Nested Objects

```javascript
const orderSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    name: z.string(),
    address: z.object({
      city: z.string(),
      pincode: z.string().length(6),
    }),
  }),
});
```

### Arrays of Objects

```javascript
const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Cart cannot be empty"),
});
```

---

## Common Validation Methods

### String Methods

| Method | What it checks |
|--------|----------------|
| `.min(n)` | At least n characters |
| `.max(n)` | At most n characters |
| `.length(n)` | Exactly n characters |
| `.email()` | Valid email format |
| `.url()` | Valid URL |
| `.regex(pattern)` | Matches a regex pattern |
| `.startsWith(str)` | Starts with given string |
| `.endsWith(str)` | Ends with given string |
| `.includes(str)` | Contains given string |
| `.toLowerCase()` | Transforms to lowercase |
| `.trim()` | Removes whitespace from ends |

### Number Methods

| Method | What it checks |
|--------|----------------|
| `.min(n)` / `.gte(n)` | Greater than or equal to n |
| `.max(n)` / `.lte(n)` | Less than or equal to n |
| `.gt(n)` | Strictly greater than n |
| `.lt(n)` | Strictly less than n |
| `.int()` | Must be an integer |
| `.positive()` | Must be > 0 |
| `.nonnegative()` | Must be >= 0 |

### Other Useful Methods

```javascript
// Enum — value must be one of the options
z.enum(["admin", "user", "guest"])

// Literal — must be exactly this value
z.literal("yes")

// Union — matches ANY of the schemas (OR condition)
z.union([z.string(), z.number()])   // string OR number

// Refine — your own custom validation logic
z.string().refine((val) => val !== "admin", {
  message: "Username 'admin' is not allowed",
})
```

---

## Parsing Data — parse vs safeParse

Zod gives you **two ways** to validate. This is important to understand:

### 1. `.parse()` — Throws an Error

```javascript
try {
  const user = signupSchema.parse(formData);  // throws if invalid
  console.log("Valid!", user);
} catch (error) {
  console.log("Invalid!", error.errors);
}
```

⚠️ Use inside `try/catch`, otherwise your app crashes.

### 2. `.safeParse()` — Returns a Result Object (Recommended ✅)

```javascript
const result = signupSchema.safeParse(formData);

if (result.success) {
  console.log(result.data);    // typed, validated data
} else {
  console.log(result.error.issues);  // array of all problems
}
```

✅ **Prefer `safeParse`** — no try/catch needed, cleaner code.

### What does an error look like?

```javascript
const result = signupSchema.safeParse({ email: "bad", age: 10 });

// result.error.issues =
[
  {
    code: "invalid_string",
    path: ["email"],                    // which field failed
    message: "Invalid email",           // human-readable message
  },
  {
    code: "too_small",
    path: ["age"],
    message: "Number must be greater than or equal to 18",
  },
]
```

---

## Error Handling & Custom Messages

### Custom Message Per Rule

Just pass a string or object as the last argument:

```javascript
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number({
    required_error: "Age is required",        // field missing
    invalid_type_error: "Age must be a number", // wrong type
  }).min(18, "You must be 18 or older"),
});
```

### Extracting Errors Easily (for forms)

```javascript
const result = signupSchema.safeParse(formData);

if (!result.success) {
  // flatten() gives you a simple field → messages map
  const errors = result.error.flatten().fieldErrors;

  console.log(errors);
  // {
  //   email: ["Please enter a valid email address"],
  //   password: ["Password must be at least 8 characters"]
  // }
}
```

---

## Advanced Features

### 1. `.refine()` — Custom Validation

```javascript
const passwordSchema = z
  .string()
  .min(8)
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[0-9]/.test(val), {
    message: "Password must contain at least one number",
  });
```

### 2. `.superRefine()` — Cross-Field Validation (e.g. confirm password)

```javascript
const formSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  });
```

### 3. `.transform()` — Modify Data After Validation

```javascript
const schema = z.object({
  email: z.string().email().transform((val) => val.toLowerCase().trim()),
  age: z.string().transform((val) => Number(val)),  // "25" → 25
});
```

### 4. `z.coerce` — Auto-Convert Types (great for query params & form inputs)

HTML forms and URL query params always give **strings**. `coerce` converts them:

```javascript
const querySchema = z.object({
  page: z.coerce.number().min(1),       // "2" → 2
  limit: z.coerce.number().max(100),    // "50" → 50
  active: z.coerce.boolean(),           // "true" → true
});

querySchema.parse({ page: "2", limit: "50", active: "true" });
// { page: 2, limit: 50, active: true }
```

### 5. TypeScript Type Inference

```typescript
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Automatically create a TypeScript type from the schema!
type User = z.infer<typeof userSchema>;
// Same as: type User = { name: string; age: number }
```

### 6. Useful Object Methods

```javascript
const base = z.object({ name: z.string(), age: z.number() });

base.partial()                    // all fields become optional (great for PATCH/update APIs)
base.pick({ name: true })         // new schema with only "name"
base.omit({ age: true })          // new schema without "age"
base.extend({ email: z.string().email() })  // add more fields
```

---

## Zod in React Frontend

### Option A: Plain Zod (simple forms)

```jsx
import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(form);

    if (!result.success) {
      // Convert Zod errors into { fieldName: message } format
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    console.log("Valid data:", result.data);
    // → send result.data to your API
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}

      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
```

### Option B: With react-hook-form (Recommended for real apps ✅)

`react-hook-form` handles form state, and `@hookform/resolvers` connects Zod to it. Much less code:

```sh
npm install react-hook-form @hookform/resolvers zod
```

```jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema
const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // error shows on confirmPassword field
  });

function SignupForm() {
  // 2. Connect schema to the form via zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  // 3. This only runs if validation passes
  const onSubmit = (data) => {
    console.log("Valid data:", data);
    // → send to API
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Username" {...register("username")} />
      {errors.username && <p style={{ color: "red" }}>{errors.username.message}</p>}

      <input placeholder="Email" {...register("email")} />
      {errors.email && <p style={{ color: "red" }}>{errors.email.message}</p>}

      <input type="password" placeholder="Password" {...register("password")} />
      {errors.password && <p style={{ color: "red" }}>{errors.password.message}</p>}

      <input type="password" placeholder="Confirm Password" {...register("confirmPassword")} />
      {errors.confirmPassword && <p style={{ color: "red" }}>{errors.confirmPassword.message}</p>}

      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignupForm;
```

**How it works:**
1. `register("fieldName")` — connects the input to the form
2. `zodResolver(signupSchema)` — runs Zod validation on submit
3. `errors.fieldName.message` — shows your custom Zod error messages automatically

---

## Zod in Express Backend

**Never trust frontend validation alone** — users can bypass it. Always validate again on the server.

### Basic Usage in a Route

```javascript
import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18),
});

app.post("/api/signup", (req, res) => {
  const result = signupSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  // result.data is clean & validated — safe to use
  const { username, email, password, age } = result.data;

  // ... hash password, save to DB, etc.
  res.status(201).json({ success: true, message: "User created" });
});
```

### Reusable Validation Middleware (Best Practice ✅)

Write it once, use it on every route:

```javascript
// middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data; // replace body with validated (and transformed) data
  next();
};
```

```javascript
// routes/userRoutes.js
import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const signupSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

// Just plug the middleware in — clean routes!
router.post("/signup", validate(signupSchema), signupController);
router.post("/login", validate(loginSchema), loginController);

export default router;
```

### Validating Query Params & URL Params

```javascript
// GET /api/users?page=2&limit=10
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

app.get("/api/users", (req, res) => {
  const result = querySchema.safeParse(req.query);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  const { page, limit, search } = result.data; // numbers, not strings!
  // ... fetch users with pagination
});

// GET /api/users/:id
const paramsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId"),
});

app.get("/api/users/:id", (req, res) => {
  const result = paramsSchema.safeParse(req.params);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }

  // ... find user by result.data.id
});
```

### Full Middleware for body + query + params

```javascript
export const validateRequest = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      errors: error.flatten().fieldErrors,
    });
  }
};

// Usage:
router.get(
  "/users/:id",
  validateRequest({ params: paramsSchema, query: querySchema }),
  getUserController
);
```

---

## Sharing Schemas Between Frontend & Backend

The **biggest superpower** of Zod: define the schema **once**, use it **everywhere**.

```
project/
├── shared/
│   └── schemas/
│       └── userSchema.js     ← ONE source of truth
├── client/  (React)
└── server/  (Express)
```

```javascript
// shared/schemas/userSchema.js
import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

```javascript
// React: import { signupSchema } from "../../shared/schemas/userSchema";
// Express: import { signupSchema } from "../../shared/schemas/userSchema";
```

Now frontend and backend **can never disagree** on what valid data looks like.

---

## Quick Reference Cheatsheet

| Task | Code |
|------|------|
| Required string | `z.string()` |
| Optional field | `z.string().optional()` |
| Default value | `z.string().default("user")` |
| Email | `z.string().email()` |
| Min/max length | `z.string().min(3).max(20)` |
| Number range | `z.number().min(18).max(100)` |
| Integer | `z.number().int()` |
| One of options | `z.enum(["a", "b", "c"])` |
| Array | `z.array(z.string())` |
| String → number | `z.coerce.number()` |
| Custom rule | `.refine(fn, { message })` |
| Cross-field check | `.superRefine((data, ctx) => ...)` |
| Modify output | `.transform(fn)` |
| Validate (throws) | `schema.parse(data)` |
| Validate (safe) | `schema.safeParse(data)` |
| Get error map | `result.error.flatten().fieldErrors` |
| All optional (PATCH) | `schema.partial()` |
| Pick fields | `schema.pick({ name: true })` |
| TS type from schema | `z.infer<typeof schema>` |

---

## Key Takeaways

1. **Zod = data validator.** Define a schema → validate data → get clean data or clear errors.
2. **3 steps only:** `z.object({...})` → `safeParse(data)` → check `result.success`.
3. **Use `safeParse`** over `parse` to avoid try/catch.
4. **Frontend:** pair with `react-hook-form` + `zodResolver` for clean forms.
5. **Backend:** use a `validate(schema)` middleware on Express routes.
6. **Share schemas** between frontend & backend — one source of truth.
7. **Always validate on the server**, even if the frontend already validates.
