# System Design — Part 2: APIs, Performance & Reliability

> Covers: API Design, Performance Optimization, Message Queues, Reliability & Fault Tolerance, Security

---

## Table of Contents

- [6. API Design](#6-api-design)
- [7. Performance Optimization](#7-performance-optimization)
- [8. Message Queues & Async Systems](#8-message-queues--async-systems)
- [9. Reliability & Fault Tolerance](#9-reliability--fault-tolerance)
- [10. Security](#10-security)

---

## 6. API Design

### REST API Design Principles

REST (Representational State Transfer) — the most common API style on the web.

**Core Rules:**

| Principle | Rule | Example |
|-----------|------|---------|
| Use **nouns**, not verbs | Resources as URLs | `/users` not `/getUsers` |
| Use **HTTP methods** | Action via method | `GET /users`, `POST /users` |
| Use **plural** names | Consistent endpoints | `/users`, `/orders` |
| Use **nesting** for relations | Show hierarchy | `/users/123/orders` |
| Return proper **status codes** | Meaningful responses | `201 Created`, `404 Not Found` |

**HTTP Methods:**

| Method | Action | Example | Idempotent? |
|--------|--------|---------|-------------|
| `GET` | Read | `GET /users/123` | ✅ Yes |
| `POST` | Create | `POST /users` | ❌ No |
| `PUT` | Replace entire resource | `PUT /users/123` | ✅ Yes |
| `PATCH` | Update partial resource | `PATCH /users/123` | ✅ Yes |
| `DELETE` | Remove | `DELETE /users/123` | ✅ Yes |

**Status Codes Cheatsheet:**

| Code | Meaning | When to Use |
|------|---------|-------------|
| `200` | OK | Successful GET/PUT/PATCH |
| `201` | Created | Successful POST |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Not authenticated |
| `403` | Forbidden | Authenticated but no permission |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |

### GraphQL Basics

A **query language** for APIs — client asks for exactly what it needs.

```
REST (multiple requests):
  GET /users/123          → { id, name, email, ... }
  GET /users/123/orders   → [{ id, total, ... }]
  GET /users/123/friends  → [{ id, name, ... }]

GraphQL (single request):
  query {
    user(id: 123) {
      name
      orders { total }
      friends { name }
    }
  }
```

| Feature | REST | GraphQL |
|---------|------|---------|
| Data fetching | Fixed response per endpoint | Client specifies exact fields |
| Over-fetching | Common (get all fields) | No (get only what you ask) |
| Under-fetching | Common (need multiple calls) | No (one query, all data) |
| Endpoints | Many (`/users`, `/orders`) | One (`/graphql`) |
| Caching | Easy (HTTP caching) | Harder (single endpoint) |
| Best for | Simple CRUD, public APIs | Complex data, mobile apps |

### gRPC Basics

A high-performance RPC framework by Google using **Protocol Buffers** (binary format).

```
REST:   Client ──HTTP/JSON──→ Server     (text, slower)
gRPC:   Client ──HTTP/2/Protobuf──→ Server  (binary, faster)
```

| Feature | REST | gRPC |
|---------|------|------|
| Protocol | HTTP/1.1 | HTTP/2 |
| Format | JSON (text) | Protobuf (binary) |
| Speed | Slower | 7-10x faster |
| Streaming | Not native | Bidirectional streaming |
| Browser support | Full | Limited (needs proxy) |
| Best for | Public APIs, web apps | Microservice-to-microservice |

### Idempotency

> An operation is **idempotent** if calling it multiple times produces the **same result**.

```
Idempotent:      DELETE /users/123
  Call 1 → User deleted (200)
  Call 2 → User already deleted (404) — no side effect

NOT Idempotent:  POST /orders
  Call 1 → Order #1 created
  Call 2 → Order #2 created (duplicate!)
```

**Why it matters:** Network retries. If a request fails, retrying an idempotent operation is safe.

**Solution for POST:** Use an **idempotency key**:
```
POST /orders
Headers: Idempotency-Key: abc-123-unique

Server checks: "Did I already process abc-123-unique?"
  Yes → Return cached response
  No  → Process and save result
```

### Pagination

Handling large datasets by returning results in chunks.

| Strategy | How | Pros | Cons |
|----------|-----|------|------|
| **Offset-based** | `?page=2&limit=20` | Simple, random access | Slow on large datasets, skips items on insert |
| **Cursor-based** | `?cursor=abc123&limit=20` | Fast, consistent | No random page access |
| **Keyset-based** | `?after_id=500&limit=20` | Very fast with index | Only forward/backward |

```
Offset:   GET /users?page=3&limit=10    → Skip 20, return 10
Cursor:   GET /users?cursor=eyJpZCI6MjB9&limit=10  → After cursor, return 10
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "page": 3,
    "limit": 10,
    "hasNext": true,
    "nextCursor": "eyJpZCI6MzB9"
  }
}
```

### API Versioning

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| **URL Path** | `/api/v1/users` | Clear, easy to use | URL changes |
| **Query Param** | `/api/users?version=1` | No URL change | Easy to miss |
| **Header** | `Accept: application/vnd.api.v1+json` | Clean URLs | Hidden, harder to test |

> **Most common:** URL path versioning (`/api/v1/`, `/api/v2/`)

### Rate Limiting in APIs

```
Headers in Response:
  X-RateLimit-Limit: 100        ← Max requests allowed
  X-RateLimit-Remaining: 42     ← Requests left
  X-RateLimit-Reset: 1635724800 ← When counter resets (Unix timestamp)

When exceeded:
  HTTP 429 Too Many Requests
  Retry-After: 30               ← Try again in 30 seconds
```

---

## 7. Performance Optimization

### Latency Reduction Techniques

| Technique | How It Helps |
|-----------|-------------|
| **Caching** | Avoid repeated DB/computation work |
| **CDN** | Serve static content from nearby servers |
| **Connection pooling** | Reuse DB connections instead of creating new ones |
| **Indexes** | Speed up database lookups |
| **Edge computing** | Run logic closer to the user |
| **Precomputation** | Calculate results ahead of time |

```
Before Optimization:
  User → Server → DB Query (50ms) → Process (30ms) → Response = 80ms

After Optimization:
  User → CDN (cached) → Response = 5ms  ✅
  User → Server → Redis Cache (2ms) → Response = 5ms  ✅
```

### Throughput Optimization

| Technique | What It Does |
|-----------|-------------|
| **Horizontal scaling** | More servers = more requests handled |
| **Load balancing** | Distribute work evenly |
| **Async processing** | Don't block on slow tasks |
| **Batching** | Group small operations into one |
| **Database read replicas** | Spread read load across copies |

```
Batching Example:
  Without: INSERT user1; INSERT user2; INSERT user3;  → 3 round trips
  With:    INSERT user1, user2, user3;                 → 1 round trip
```

### Asynchronous Processing

Don't make the user wait for tasks that can happen in the background.

```
Synchronous (blocking):
  User → Upload Image → Resize → Upload to S3 → Save to DB → Response
  Total: 5 seconds  😢

Asynchronous (non-blocking):
  User → Upload Image → Queue resize job → Response (instant!)
  Background: Queue → Resize → Upload to S3 → Save to DB
  Total: 200ms for user  ✅
```

**Common Async Tasks:**
- Email / SMS sending
- Image/video processing
- PDF generation
- Analytics / logging
- Notifications

### Connection Pooling

Reuse database connections instead of opening/closing for every request.

```
Without Pool:
  Request 1 → Open connection → Query → Close connection
  Request 2 → Open connection → Query → Close connection
  (Opening a connection takes ~20-50ms each time)

With Pool:
  Pool: [Conn1, Conn2, Conn3, Conn4, Conn5]
  Request 1 → Borrow Conn1 → Query → Return Conn1
  Request 2 → Borrow Conn2 → Query → Return Conn2
  (No connection overhead!)
```

| Setting | Meaning | Typical Value |
|---------|---------|---------------|
| `min` | Minimum connections kept open | 5 |
| `max` | Maximum connections allowed | 20 |
| `idleTimeout` | Close idle connections after | 30 seconds |

### Data Compression

Reduce the size of data sent over the network.

| Method | Compression | Speed | Use Case |
|--------|------------|-------|----------|
| **Gzip** | Good (70-80% reduction) | Medium | General web content |
| **Brotli** | Better (80-90% reduction) | Slower | Static assets |
| **Deflate** | Good | Fast | Legacy support |

```
Without compression:  API Response = 500 KB
With Gzip:            API Response = 75 KB  (85% smaller)
```

```
Request:   Accept-Encoding: gzip, br
Response:  Content-Encoding: gzip
```

### Lazy Loading

Load data/resources **only when needed**, not all at once.

```
Eager Loading (upfront):
  Page Load → Load ALL 200 images → Render  (slow initial load)

Lazy Loading (on demand):
  Page Load → Load 10 visible images → Render  (fast!)
  User scrolls → Load next 10 images
```

| Where | What | Example |
|-------|------|---------|
| **Frontend** | Images, components | Image loads when scrolled into view |
| **Backend** | Related data | Load user's orders only if requested |
| **Database** | Relations | Don't JOIN unless needed |

---

## 8. Message Queues & Async Systems

### Why Async Processing?

```
Problem: Service A calls Service B directly
  - If B is slow → A is slow
  - If B is down → A fails
  - If B is overwhelmed → requests dropped

Solution: Put a queue between them
  Service A → [Message Queue] → Service B
  - A sends and moves on (fast)
  - B processes at its own pace
  - If B is down, messages wait safely
```

| Benefit | Explanation |
|---------|-------------|
| **Decoupling** | Services don't need to know about each other |
| **Resilience** | Messages survive if consumer is down |
| **Scalability** | Add more consumers to process faster |
| **Traffic smoothing** | Handle spikes without overloading |

### Message Brokers

| Broker | Type | Best For | Used By |
|--------|------|----------|---------|
| **Apache Kafka** | Distributed log | High-throughput streaming, event logs | LinkedIn, Uber, Netflix |
| **RabbitMQ** | Traditional queue | Task queues, routing | Many startups |
| **Amazon SQS** | Managed queue | Simple queuing in AWS | AWS-based apps |
| **Redis Pub/Sub** | In-memory | Real-time, lightweight messaging | Chat, notifications |

**Kafka vs RabbitMQ:**

| Feature | Kafka | RabbitMQ |
|---------|-------|----------|
| Model | Distributed log (append-only) | Message queue (consume & delete) |
| Throughput | Very high (millions/sec) | High (thousands/sec) |
| Message retention | Keeps messages (configurable) | Deletes after consumption |
| Ordering | Per partition | Per queue |
| Replay | ✅ Can re-read messages | ❌ Once consumed, gone |
| Best for | Event streaming, analytics | Task processing, work queues |

### Pub/Sub Model

Publishers send messages to **topics**, subscribers receive from topics they're interested in.

```
                    ┌──────────────┐
  Order Service ──→ │  "orders"    │ ──→ Email Service (sends confirmation)
                    │   Topic      │ ──→ Inventory Service (updates stock)
                    └──────────────┘ ──→ Analytics Service (tracks sales)

Publisher doesn't know (or care) who the subscribers are!
```

| Pattern | Flow | Use Case |
|---------|------|----------|
| **Point-to-Point** | 1 producer → Queue → 1 consumer | Task processing |
| **Pub/Sub** | 1 producer → Topic → Many consumers | Event broadcasting |
| **Fan-out** | 1 message → copied to multiple queues | Parallel processing |

### Event-Driven Architecture

Services communicate by **producing and consuming events** instead of direct calls.

```
Traditional (synchronous):
  User signs up → Create user → Send email → Send SMS → Create profile → Response
  (All must succeed, slow, tightly coupled)

Event-Driven (asynchronous):
  User signs up → Create user → Emit "UserCreated" event → Response (fast!)

  Listeners (independent):
    EmailService     listens → sends welcome email
    SMSService       listens → sends verification SMS
    ProfileService   listens → creates default profile
    AnalyticsService listens → tracks signup
```

### Dead Letter Queues (DLQ)

A special queue for messages that **fail processing** repeatedly.

```
Main Queue → Consumer tries to process → ❌ Fails
                                        → ❌ Fails (retry 1)
                                        → ❌ Fails (retry 2)
                                        → ❌ Fails (retry 3)
                                        → Moved to DLQ

DLQ → Engineer investigates → Fixes bug → Reprocesses messages
```

| Setting | Purpose | Example |
|---------|---------|---------|
| `maxRetries` | How many times to retry | 3-5 |
| `retryDelay` | Wait between retries | 1s, 5s, 30s (exponential) |
| `dlqTopic` | Where failed messages go | `orders-dlq` |

---

## 9. Reliability & Fault Tolerance

### High Availability Design

> Design for failure. **Everything fails eventually** — your system should keep running.

```
Single Point of Failure:
  Users → [Server] → [Database]
  If server dies → 💀 Everything down

High Availability:
  Users → [Load Balancer] → [Server 1]  → [DB Primary]
                           → [Server 2]     ↓ replication
                           → [Server 3]  → [DB Replica]
  If Server 2 dies → traffic goes to 1 & 3 ✅
  If DB Primary dies → Replica promoted ✅
```

### Redundancy

Having **backup components** ready to take over.

| Type | What | Example |
|------|------|---------|
| **Active-Active** | All copies handle traffic simultaneously | Multiple app servers behind LB |
| **Active-Passive** | Backup sits idle until primary fails | Standby database |
| **Geographic** | Copies in different regions | US-East + EU-West data centers |

```
Active-Active:    [Server A] ←──traffic──→ [Server B]
                  Both serving requests

Active-Passive:   [Server A] ←──traffic     [Server B] (standby)
                  A fails → B takes over
```

### Failover Strategies

| Strategy | How | Recovery Time |
|----------|-----|---------------|
| **Cold Standby** | Backup is off, start when needed | Minutes |
| **Warm Standby** | Backup is running but not serving | Seconds |
| **Hot Standby** | Backup is running and synced, instant switch | Near-zero |

```
DNS Failover:
  user.com → Health Check → Server A (healthy) ✅ → Route here
                           → Server B (standby)

  Server A fails:
  user.com → Health Check → Server A (unhealthy) ❌
                           → Server B (healthy) ✅ → Route here
```

### Circuit Breaker Pattern

Prevents a failing service from bringing down the entire system.

```
States:
  ┌────────┐    failures > threshold    ┌──────┐
  │ CLOSED │ ────────────────────────→  │ OPEN │
  │(normal)│                            │(fail)│
  └────────┘                            └──┬───┘
       ↑                                   │
       │         after timeout              ▼
       │                              ┌───────────┐
       └──────── success ────────────│ HALF-OPEN  │
                                     │ (testing)  │
                                     └───────────┘
```

| State | Behavior |
|-------|----------|
| **Closed** | Normal operation — requests pass through |
| **Open** | All requests fail immediately (don't even try) |
| **Half-Open** | Allow 1 test request — if success → Closed, if fail → Open |

```
Example:
  Payment Service → Circuit Breaker → External Payment API

  Normal:    All requests go through (CLOSED)
  API down:  5 failures in a row → OPEN → Return "Service unavailable" immediately
  After 30s: Try one request (HALF-OPEN)
  Success:   Back to CLOSED ✅
  Failure:   Stay OPEN, wait another 30s
```

### Retry Mechanisms

| Strategy | Delay Pattern | Example |
|----------|--------------|---------|
| **Fixed delay** | Same wait each time | 2s, 2s, 2s |
| **Exponential backoff** | Double the wait each time | 1s, 2s, 4s, 8s, 16s |
| **Exponential + jitter** | Backoff + random offset | 1.2s, 2.7s, 4.1s, 8.9s |

```
Exponential Backoff with Jitter:

  Attempt 1: Wait 1s  + random(0-500ms)
  Attempt 2: Wait 2s  + random(0-500ms)
  Attempt 3: Wait 4s  + random(0-500ms)
  Attempt 4: Wait 8s  + random(0-500ms)
  Attempt 5: Give up → Send to DLQ
```

> **Jitter** prevents the **thundering herd problem** — thousands of clients retrying at the exact same moment.

### Health Checks

Regularly verify that services are alive and functioning.

| Type | What It Checks | Example |
|------|---------------|---------|
| **Liveness** | Is the process running? | `GET /health` → `200 OK` |
| **Readiness** | Can it handle requests? | DB connected? Cache reachable? |
| **Deep health** | All dependencies healthy? | Check DB + Cache + External APIs |

```
GET /health

Response (healthy):
{
  "status": "healthy",
  "uptime": "48h",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "diskSpace": "72% available"
  }
}

Response (degraded):
{
  "status": "degraded",
  "checks": {
    "database": "connected",
    "redis": "disconnected",     ← Problem!
    "diskSpace": "72% available"
  }
}
```

---

## 10. Security

### Authentication vs Authorization

```
Authentication (AuthN):  "WHO are you?"     → Login, prove identity
Authorization  (AuthZ):  "WHAT can you do?" → Check permissions
```

| Aspect | Authentication | Authorization |
|--------|---------------|---------------|
| Question | Who are you? | What can you access? |
| Happens | First | After authentication |
| How | Password, token, biometric | Roles, permissions, policies |
| Example | Login with email/password | Admin can delete, user can only read |

```
Flow:
  User → Login (email + password) → Server verifies → ✅ Authenticated
       → Access /admin → Server checks role → ❌ Not authorized (user role, not admin)
```

### JWT (JSON Web Token)

A self-contained token that carries user info — no need to query DB on every request.

```
Structure: header.payload.signature

Header:    { "alg": "HS256", "typ": "JWT" }
Payload:   { "userId": 123, "role": "admin", "exp": 1735689600 }
Signature: HMACSHA256(header + payload, SECRET_KEY)

Result: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEyM30.SflKxwRJSMeKKF2QT4fwpM
```

```
Flow:
  1. User logs in → Server creates JWT → Sends to client
  2. Client stores JWT (cookie / localStorage)
  3. Client sends JWT with every request:  Authorization: Bearer <token>
  4. Server verifies signature → Extracts user info → No DB query needed!
```

| Token Type | Lifetime | Purpose |
|-----------|----------|---------|
| **Access Token** | Short (15 min – 1 hour) | Authenticate API requests |
| **Refresh Token** | Long (7 – 30 days) | Get new access token without re-login |

### OAuth 2.0

Lets users **grant third-party apps access** without sharing their password.

```
Example: "Login with Google"

  1. User clicks "Login with Google" on YourApp
  2. YourApp redirects to Google's login page
  3. User logs in to Google & grants permission
  4. Google redirects back with an authorization code
  5. YourApp exchanges code for access token (server-to-server)
  6. YourApp uses token to fetch user's Google profile
```

| Grant Type | Use | Flow |
|-----------|-----|------|
| **Authorization Code** | Web apps (most secure) | Code → Token exchange on server |
| **PKCE** | Mobile / SPA apps | Auth Code + code verifier |
| **Client Credentials** | Machine-to-machine | Direct token (no user involved) |

### HTTPS & SSL/TLS

```
HTTP:   Data sent as plain text         → Anyone can read it 😱
HTTPS:  Data encrypted with TLS         → Only sender & receiver can read ✅
```

**TLS Handshake (simplified):**
```
  Client                              Server
    │── ClientHello (supported ciphers)──→│
    │←── ServerHello + Certificate ───────│
    │── Verify cert + Generate key ──→    │
    │←── Encrypted connection ready ──────│
    │◄═══════ Encrypted Data ════════════►│
```

### Data Encryption

| Type | When | How | Example |
|------|------|-----|---------|
| **At Rest** | Data stored on disk | AES-256 encryption | Encrypted database, S3 bucket |
| **In Transit** | Data moving over network | TLS/SSL | HTTPS, encrypted API calls |
| **End-to-End** | Sender → Receiver only | Public key encryption | WhatsApp messages |

```
At Rest:     [Encrypted DB] → key needed to read
In Transit:  Client ══TLS══→ Server (encrypted pipe)
E2E:         User A ══encrypt══→ Server (can't read) ══→ User B decrypts
```

### API Security Best Practices

| Practice | Why | How |
|----------|-----|-----|
| **Use HTTPS** | Encrypt all traffic | SSL/TLS certificate |
| **Authenticate requests** | Know who's calling | JWT, API keys, OAuth |
| **Rate limiting** | Prevent abuse/DDoS | Token bucket, sliding window |
| **Input validation** | Prevent injection attacks | Sanitize & validate all input |
| **CORS policy** | Control who can call your API | Whitelist allowed origins |
| **API keys** | Identify & track consumers | Unique key per client |
| **Helmet headers** | Protect against common attacks | `X-Content-Type-Options`, `X-Frame-Options` |
| **No sensitive data in URLs** | URLs get logged | Use headers/body for tokens, passwords |

```
Security Layers:
  Request → Rate Limiter → Auth Check → Input Validation → Business Logic
              ↓                ↓              ↓
          429 Reject      401 Reject     400 Reject
```

### Rate Limiting for Security

```
Types of attacks rate limiting prevents:
  ✅ Brute force login attempts
  ✅ DDoS mitigation
  ✅ API scraping/abuse
  ✅ Resource exhaustion

Implementation:
  Login endpoint:     5 attempts / 15 minutes per IP
  API endpoint:       100 requests / minute per user
  Signup endpoint:    3 accounts / hour per IP
```

---

> **Previous: [Part 1](System_Design_Part_1.md)** — Introduction, Fundamentals, Scalability, Caching, Databases
>
> **Next: [Part 3](System_Design_Part_3.md)** — Design Patterns, Monitoring, Deployment, Approach & Case Studies
