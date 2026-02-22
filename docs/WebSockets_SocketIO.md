# WebSockets and Socket.IO

> Last Updated: February 22, 2026

## Table of Contents
- [What are WebSockets](#what-are-websockets)
- [Setup](#setup)
- [Server - Socket.IO](#server---socketio)
- [Client - React](#client---react)
- [Rooms and Namespaces](#rooms-and-namespaces)
- [Authentication](#authentication)
- [Common Events Pattern](#common-events-pattern)
- [Chat Application Example](#chat-application-example)
- [Deployment Notes](#deployment-notes)

---

## What are WebSockets

HTTP is one-way: client sends a request, server responds. WebSocket is a two-way persistent connection. Either side can send data anytime.

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Connection | New connection per request | Persistent connection |
| Direction | Client to server only | Bidirectional |
| Overhead | Headers with every request | Minimal after handshake |
| Use Case | REST APIs, page loads | Real-time chat, notifications, live data |

---

## Setup

### Server

```bash
npm install express socket.io cors
```

### Client

```bash
npm install socket.io-client
```

---

## Server - Socket.IO

```javascript
// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Connection event
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for events from client
  socket.on("message", (data) => {
    console.log("Received:", data);

    // Send to all clients except sender
    socket.broadcast.emit("message", data);

    // Send to all clients including sender
    // io.emit("message", data);

    // Send only to sender
    // socket.emit("message", data);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## Client - React

```jsx
// hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
};
```

```jsx
// components/Chat.jsx
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("message");
    };
  }, [socketRef]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const data = { text: input, timestamp: Date.now() };
    socketRef.current.emit("message", data);
    setMessages((prev) => [...prev, { ...data, isMine: true }]);
    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <div key={i}>{msg.text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};
```

---

## Rooms and Namespaces

### Rooms

Rooms allow you to group sockets and emit to specific subsets.

```javascript
// Server
io.on("connection", (socket) => {
  // Join a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("user-joined", { userId: socket.id });
  });

  // Send message to a specific room
  socket.on("room-message", ({ roomId, message }) => {
    io.to(roomId).emit("room-message", {
      message,
      senderId: socket.id,
    });
  });

  // Leave a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { userId: socket.id });
  });
});
```

### Emit Methods Summary

```javascript
// To sender only
socket.emit("event", data);

// To all clients except sender
socket.broadcast.emit("event", data);

// To all clients
io.emit("event", data);

// To everyone in a room except sender
socket.to("room-1").emit("event", data);

// To everyone in a room including sender
io.to("room-1").emit("event", data);

// To a specific socket
io.to(socketId).emit("event", data);
```

---

## Authentication

### JWT Authentication Middleware

```javascript
import jwt from "jsonwebtoken";

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userName = decoded.name;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Now socket.userId is available in all events
io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);
});
```

### Client-side Auth

```javascript
const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem("accessToken"),
  },
});

// Handle auth errors
socket.on("connect_error", (err) => {
  if (err.message === "Authentication required") {
    // Redirect to login
  }
});
```

---

## Common Events Pattern

```javascript
// Server-side event handlers
io.on("connection", (socket) => {
  // Typing indicator
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing", { userId: socket.userId });
  });

  socket.on("stop-typing", (roomId) => {
    socket.to(roomId).emit("stop-typing", { userId: socket.userId });
  });

  // Online status
  const onlineUsers = new Map();

  onlineUsers.set(socket.userId, socket.id);
  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  // Notifications
  socket.on("send-notification", ({ recipientId, notification }) => {
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("notification", notification);
    }
  });
});
```

---

## Chat Application Example

### Store Connected Users

```javascript
// utils/users.js
const users = new Map();

export const addUser = (userId, socketId) => users.set(userId, socketId);
export const removeUser = (socketId) => {
  for (const [userId, sid] of users) {
    if (sid === socketId) {
      users.delete(userId);
      return userId;
    }
  }
};
export const getUser = (userId) => users.get(userId);
export const getOnlineUsers = () => Array.from(users.keys());
```

### Chat Server

```javascript
import { addUser, removeUser, getUser, getOnlineUsers } from "./utils/users.js";

io.on("connection", (socket) => {
  addUser(socket.userId, socket.id);
  io.emit("online-users", getOnlineUsers());

  // Private message
  socket.on("private-message", async ({ recipientId, message }) => {
    const recipientSocket = getUser(recipientId);

    // Save to database
    // await Message.create({ sender: socket.userId, recipient: recipientId, text: message });

    if (recipientSocket) {
      io.to(recipientSocket).emit("private-message", {
        senderId: socket.userId,
        message,
        timestamp: Date.now(),
      });
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    io.emit("online-users", getOnlineUsers());
  });
});
```

---

## Deployment Notes

### Nginx Reverse Proxy

Add WebSocket support to your Nginx config:

```nginx
location /socket.io/ {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Apache Reverse Proxy

Enable required modules and add to config:

```apache
# Enable modules
a2enmod proxy proxy_wstunnel proxy_http

# In VirtualHost
ProxyPass /socket.io/ ws://localhost:5000/socket.io/
ProxyPassReverse /socket.io/ ws://localhost:5000/socket.io/
```

### PM2 with Socket.IO

Use sticky sessions for multiple instances:

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "app",
    script: "server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
  }],
};
```

Note: For Socket.IO with PM2 cluster mode, use `@socket.io/sticky` and `@socket.io/cluster-adapter`.
