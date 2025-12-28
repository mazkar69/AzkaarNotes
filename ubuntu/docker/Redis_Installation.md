# Redis Installation on Ubuntu Server using Docker (With Authentication)

This guide explains how to install **Redis using Docker** on an **Ubuntu server**, configure **password authentication**, enable **persistence**, and connect Redis from **RedisInsight (GUI)** or **Node.js applications** (BullMQ, ioredis, etc.).

---

## ✅ Prerequisites

- Ubuntu Server
- Docker installed and running
- Port `6379` allowed in EC2 Security Group (restricted to your IP)

---

## 📁 Step 1: Create Directories for Redis

```bash
mkdir -p /opt/redis/data
mkdir -p /opt/redis/config
```

---

## ⚙️ Step 2: Create Redis Configuration File

```bash
nano /opt/redis/config/redis.conf
```

```conf
bind 0.0.0.0
protected-mode yes

requirepass StrongRedisPassword123

appendonly yes
dir /data

maxmemory 512mb
maxmemory-policy allkeys-lru

timeout 0
tcp-keepalive 300
```

---

## 🐳 Step 3: Run Redis Container

```bash
docker run -d \
  --name redis-server \
  -p 6379:6379 \
  -v /opt/redis/data:/data \
  -v /opt/redis/config/redis.conf:/usr/local/etc/redis/redis.conf \
  redis:7 \
  redis-server /usr/local/etc/redis/redis.conf
```

---

## 🔐 Step 4: Test Redis Authentication

```bash
docker exec -it redis-server redis-cli
```

```redis
AUTH StrongRedisPassword123
PING
```

---

## 🌐 Redis Connection URL

```
redis://:StrongRedisPassword123@SERVER_IP:6379
```

---

## 🖥 Connect from Node.js

```js
import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'jbT0hnNbOHRn58Dhg7Jmc2QRXdZki8Ri',
    socket: {
        host: '13.235.xxx.xxx',   //AWS EC2 Public IP
        port: 19758
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar



```

### Connection for BullMQ or ioredis:

```js
import IORedis from 'ioredis';

const redis = new IORedis({
  host: 'SERVER_IP',
  port: 6379,
  password: 'StrongRedisPassword123',
  maxRetriesPerRequest: null
});
```

```js
import IORedis from 'ioredis';

const connection = new IORedis(
    'redis://:StrongRedisPassword123@13.235.xxx.xxx:6379',
    {
        maxRetriesPerRequest: null
    }
);

```

---

## 🔒 Security Notes

- Never expose Redis to the public internet
- Always restrict port 6379
- Use a strong password

---

## ✅ Summary

Redis is now running securely in Docker with authentication and persistence.
