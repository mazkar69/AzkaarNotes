# Environment Variables - Vite, Next.js, Nuxt.js and Node.js

> Last Updated: February 22, 2026

## Table of Contents
- [Node.js (Express)](#nodejs-express)
- [Vite (React/Vue)](#vite-reactvue)
- [Next.js](#nextjs)
- [Nuxt.js](#nuxtjs)
- [Common Patterns](#common-patterns)

---

## Node.js (Express)

### Setup

```bash
npm install dotenv
```

### Usage

Create `.env` file in root:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/mydb
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

Load in entry file:
```javascript
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;
const dbUri = process.env.MONGO_URI;
```

### Notes
- All variables are accessed via `process.env.VARIABLE_NAME`
- No prefix required
- Never commit `.env` to git

---

## Vite (React/Vue)

### Rules
- Variables must start with `VITE_` prefix
- Accessed via `import.meta.env.VITE_*`
- Exposed to client-side (browser) — never put secrets here

### .env Files

```
.env                  # Loaded in all cases
.env.local            # Loaded in all cases, ignored by git
.env.development      # Loaded in development mode
.env.production       # Loaded in production mode
```

### Example

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MyApp
VITE_GOOGLE_MAPS_KEY=your-key
```

```javascript
// Access in code
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;

// Built-in variables
import.meta.env.MODE       // "development" or "production"
import.meta.env.DEV        // true in dev
import.meta.env.PROD       // true in production
import.meta.env.BASE_URL   // base URL from config
```

### TypeScript Support

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Next.js

### Rules
- `NEXT_PUBLIC_` prefix = exposed to browser (client-side)
- No prefix = server-side only (API routes, getServerSideProps)
- No need for dotenv — Next.js loads `.env` files automatically

### .env Files (loaded in order)

```
.env                    # All environments
.env.local              # All environments (git ignored)
.env.development        # next dev
.env.development.local  # next dev (git ignored)
.env.production         # next build / next start
.env.production.local   # next build / next start (git ignored)
```

### Example

```env
# Server-side only (secure)
DATABASE_URL=mongodb://localhost:27017/mydb
JWT_SECRET=my-secret-key
STRIPE_SECRET_KEY=sk_test_123

# Client-side (exposed to browser)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=MyApp
```

```javascript
// Server-side (API routes, getServerSideProps, Server Components)
const dbUrl = process.env.DATABASE_URL;

// Client-side (components, pages)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Server Component vs Client Component

```javascript
// Server Component - can access all env vars
export default function Page() {
  const secret = process.env.JWT_SECRET; // works
  return <div>Server rendered</div>;
}

// Client Component - only NEXT_PUBLIC_ vars
"use client";
export default function Component() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL; // works
  const secret = process.env.JWT_SECRET; // undefined
  return <div>Client rendered</div>;
}
```

---

## Nuxt.js

### Nuxt 3

Define runtime config in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-side only
    jwtSecret: process.env.JWT_SECRET,
    dbUrl: process.env.DATABASE_URL,

    // Client-side (exposed to browser)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      appName: "MyApp",
    },
  },
});
```

```env
JWT_SECRET=my-secret-key
DATABASE_URL=mongodb://localhost:27017/mydb
NUXT_PUBLIC_API_BASE=http://localhost:5000/api
```

### Usage in Components

```vue
<script setup>
const config = useRuntimeConfig();

// Client-side
const apiBase = config.public.apiBase;

// Server-side only (in server/ directory)
// const secret = config.jwtSecret;
</script>
```

### Usage in Server Routes

```javascript
// server/api/users.get.js
export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const dbUrl = config.dbUrl; // server-only
  // ...
});
```

---

## Common Patterns

### .gitignore

Always add these to `.gitignore`:
```
.env
.env.local
.env.development.local
.env.production.local
```

### .env.example

Create an `.env.example` file and commit it to git as a template:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=
JWT_SECRET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Validate Required Variables

```javascript
// config/validateEnv.js
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "PORT",
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});
```

### Quick Reference

| Framework | Prefix for Client | Access Method |
|-----------|------------------|---------------|
| Node.js | None (all server) | `process.env.VAR` |
| Vite | `VITE_` | `import.meta.env.VITE_VAR` |
| Next.js | `NEXT_PUBLIC_` | `process.env.NEXT_PUBLIC_VAR` |
| Nuxt 3 | `NUXT_PUBLIC_` | `useRuntimeConfig().public.var` |
