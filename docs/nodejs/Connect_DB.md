# Connect DB — MongoDB with Mongoose

> **Purpose:** Singleton MongoDB connection using Mongoose. Caches the connection state to avoid reconnecting on every request (important in Next.js and serverless environments).

---

## Install

```sh
npm install mongoose
```

---

## Code

```js
import mongoose from "mongoose";

const connection = {};

async function connectDB() {
    if (connection.isConnected) {
        return; // Already connected — reuse existing connection
    }

    const db = await mongoose.connect(process.env.MONGO_URI);

    console.log("Database connected :)");

    connection.isConnected = db.connections[0].readyState;
}

export default connectDB;
```

---

## Environment Variable

Add to `.env`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
```

---

## Usage in Express (`server.js` / `app.js`)

```js
import express from "express";
import connectDB from "./connectDB.js";

const app = express();

connectDB(); // Connect once on startup

app.listen(3000, () => console.log("Server running on port 3000"));
```

## Usage in Next.js (App Router)

```js
// lib/connectDB.js — call before any DB operation
import connectDB from "./connectDB.js";

export async function GET() {
    await connectDB();
    const data = await MyModel.find();
    return Response.json(data);
}
```

---

## Connection States (readyState)

| Value | State |
|-------|-------|
| `0` | Disconnected |
| `1` | Connected |
| `2` | Connecting |
| `3` | Disconnecting |

> The `connection.isConnected` check uses `readyState === 1` to avoid multiple connections.

---

## Notes

- `connection` object is module-scoped — persists across hot reloads in Next.js
- In serverless (Vercel/Lambda), always call `connectDB()` at the top of each handler
- Mongoose automatically handles connection pooling — don't call `connect()` multiple times
