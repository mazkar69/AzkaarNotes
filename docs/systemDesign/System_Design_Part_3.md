# System Design — Part 3: Patterns, DevOps & Interview Mastery

> Covers: Design Patterns, Monitoring & Logging, Deployment & DevOps, Approach to System Design, Case Studies, Interview Tips

---

## Table of Contents

- [11. System Design Patterns](#11-system-design-patterns)
- [12. Monitoring & Logging](#12-monitoring--logging)
- [13. Deployment & DevOps Basics](#13-deployment--devops-basics)
- [14. Approach to System Design 🔥](#14-approach-to-system-design-)
- [15. Case Studies](#15-case-studies)
- [16. Interview Tips](#16-interview-tips)

---

## 11. System Design Patterns

### Microservices Architecture

Breaking an application into **small, independent services** that each handle one business function.

```
Monolith:                          Microservices:
┌─────────────────────┐           ┌──────────┐  ┌──────────┐
│  Auth + Orders +    │           │ Auth     │  │ Orders   │
│  Products + Payments│           │ Service  │  │ Service  │
│  Notifications      │           └──────────┘  └──────────┘
│  (ALL IN ONE)       │           ┌──────────┐  ┌──────────┐
└─────────────────────┘           │ Products │  │ Payments │
                                  │ Service  │  │ Service  │
                                  └──────────┘  └──────────┘
```

### Monolith vs Microservices

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Deployment | Deploy everything at once | Deploy services independently |
| Scaling | Scale entire app | Scale individual services |
| Tech stack | One language/framework | Each service can use different tech |
| Complexity | Simple to build | Complex to manage |
| Data | Shared database | Database per service |
| Failure | One bug can crash everything | Failure is isolated |
| Team | Small team works well | Large teams (team per service) |
| Best for | MVPs, small apps | Large-scale production systems |

**When to move from Monolith → Microservices:**
```
✅ Team is growing (10+ developers)
✅ Different parts need different scaling
✅ Deployments are slow and risky
✅ One module's failure crashes everything

❌ DON'T start with microservices for a new project
❌ DON'T split if you don't have DevOps expertise
```

### Service Discovery

How do services **find each other** in a dynamic environment where IPs change?

```
Without Discovery:
  Order Service → hardcoded IP 10.0.1.5:3000 → Payment Service
  (What if Payment Service moves? 💀)

With Discovery:
  Order Service → "Where is payment-service?" → Service Registry → 10.0.2.8:3000
```

| Type | How | Example |
|------|-----|---------|
| **Client-side** | Client queries registry, picks an instance | Netflix Eureka |
| **Server-side** | Load balancer queries registry, routes request | AWS ALB, Kubernetes |
| **DNS-based** | Service name resolves to IP via DNS | Kubernetes DNS, Consul |

```
Service Registry:
┌─────────────────────────────────────────┐
│  Service          │ Instances           │
├───────────────────┼─────────────────────┤
│  auth-service     │ 10.0.1.2, 10.0.1.3 │
│  order-service    │ 10.0.2.5            │
│  payment-service  │ 10.0.3.1, 10.0.3.2 │
└───────────────────┴─────────────────────┘
```

### API Gateway

A **single entry point** for all client requests — routes, authenticates, rate limits, and transforms.

```
Without Gateway:                    With API Gateway:
Client → Auth Service               Client → [API Gateway] → Auth Service
Client → Order Service                                     → Order Service
Client → Product Service                                   → Product Service
Client → Payment Service                                   → Payment Service
(Client needs to know every service)  (Client knows ONE URL)
```

**What an API Gateway does:**

| Function | Description |
|----------|-------------|
| **Routing** | Route `/api/orders` → Order Service |
| **Authentication** | Verify JWT before forwarding |
| **Rate Limiting** | Throttle abusive clients |
| **Load Balancing** | Distribute across service instances |
| **Request Aggregation** | Combine multiple service responses into one |
| **Protocol Translation** | REST → gRPC, HTTP → WebSocket |
| **Caching** | Cache frequent responses |
| **Logging & Monitoring** | Central place for metrics |

**Tools:** Kong, AWS API Gateway, Nginx, Traefik, Zuul

### Circuit Breaker (Recap)

> Covered in [Part 2 — Section 9](System_Design_Part_2.md#circuit-breaker-pattern). Prevents cascading failures by stopping calls to a failing service.

```
CLOSED (normal) ──failures exceed threshold──→ OPEN (reject all)
                                                   │
        ↑                                     timeout
        │                                          │
        └───── success ───── HALF-OPEN (try one) ──┘
```

### Bulkhead Pattern

**Isolate components** so that failure in one doesn't exhaust resources for others.

```
Without Bulkhead:
  ┌───────────────────────────────┐
  │     Shared Thread Pool (100)  │
  │  Orders ──→ 95 threads (slow API call)
  │  Products ──→ 5 threads left 😱
  │  Auth ──→ 0 threads (BLOCKED!)
  └───────────────────────────────┘

With Bulkhead:
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ Orders Pool  │ │ Products Pool│ │ Auth Pool    │
  │ (40 threads) │ │ (30 threads) │ │ (30 threads) │
  │ 38 used      │ │ 10 used      │ │ 5 used       │
  └──────────────┘ └──────────────┘ └──────────────┘
  Orders slow? Products & Auth still fine! ✅
```

> Named after ship bulkheads — compartments that prevent water from flooding the entire ship.

### Saga Pattern

Managing **distributed transactions** across multiple microservices.

**Problem:** In a monolith, one DB transaction handles everything. In microservices, each service has its own DB — no global transaction!

```
Example: Place an Order
  1. Order Service    → Create order
  2. Payment Service  → Charge payment
  3. Inventory Service → Reserve items
  4. Shipping Service → Schedule delivery

  What if step 3 fails? Need to undo steps 1 and 2!
```

| Type | How | Pros | Cons |
|------|-----|------|------|
| **Choreography** | Each service listens for events and acts | Simple, decoupled | Hard to track, debug |
| **Orchestration** | Central orchestrator directs the flow | Easy to track, manage | Single point of failure |

```
Choreography (event-driven):
  Order Created → (event) → Payment Charged → (event) → Inventory Reserved
  Inventory Failed → (event) → Payment Refunded → (event) → Order Cancelled

Orchestration (central coordinator):
  Saga Orchestrator:
    1. Tell Order Service: "Create order"     ✅
    2. Tell Payment Service: "Charge"         ✅
    3. Tell Inventory Service: "Reserve"      ❌ Failed!
    4. Tell Payment Service: "Refund"         ✅ (compensate)
    5. Tell Order Service: "Cancel order"     ✅ (compensate)
```

**Compensating Transactions:**

| Step | Action | Compensating Action |
|------|--------|-------------------|
| Create Order | `createOrder()` | `cancelOrder()` |
| Charge Payment | `chargePayment()` | `refundPayment()` |
| Reserve Inventory | `reserveStock()` | `releaseStock()` |
| Schedule Shipping | `scheduleShipping()` | `cancelShipping()` |

---

## 12. Monitoring & Logging

### Logging Strategies

| Level | When to Use | Example |
|-------|-------------|---------|
| **ERROR** | Something broke | `Failed to connect to database` |
| **WARN** | Something concerning | `API response time > 2s` |
| **INFO** | Normal operations | `User 123 logged in` |
| **DEBUG** | Detailed dev info | `Query returned 42 rows in 15ms` |

**Structured Logging** (use JSON, not plain text):

```
❌ Bad:   "User 123 placed order 456 for $99.99"

✅ Good:  {
            "timestamp": "2026-03-25T10:30:00Z",
            "level": "INFO",
            "service": "order-service",
            "event": "order_placed",
            "userId": 123,
            "orderId": 456,
            "amount": 99.99
          }
```

**Why structured?** → Easy to search, filter, and aggregate in log tools.

**Best Practices:**
```
✅ Use correlation/request IDs across services
✅ Log at service boundaries (entry/exit)
✅ Include timestamps (UTC)
✅ Never log passwords, tokens, or PII
✅ Use appropriate log levels
❌ Don't log every line of code
❌ Don't use console.log in production
```

### Metrics

Key system metrics to monitor:

| Category | Metric | Warning Threshold |
|----------|--------|-------------------|
| **CPU** | Usage % | > 70% sustained |
| **Memory** | Usage % | > 80% |
| **Disk** | Usage % | > 85% |
| **Latency** | p50, p95, p99 response time | p99 > 1s |
| **Throughput** | Requests per second | Depends on baseline |
| **Error Rate** | % of 5xx responses | > 1% |
| **Saturation** | Queue depth, thread pool usage | Near capacity |

**The Four Golden Signals (Google SRE):**

```
1. Latency      → How long requests take
2. Traffic      → How many requests (demand)
3. Errors       → Rate of failed requests
4. Saturation   → How "full" the system is
```

**Percentile Latency:**
```
p50 = 100ms   → 50% of requests finish in 100ms (median)
p95 = 300ms   → 95% finish in 300ms
p99 = 1200ms  → 99% finish in 1.2s (the slow tail)

Focus on p95 and p99 — they show worst-case user experience.
```

### Distributed Tracing

Track a single request as it flows across **multiple services**.

```
Without tracing:
  "Order is slow" → Which service? No idea. 🤷

With tracing (Trace ID: abc-123):
  API Gateway     [──── 5ms ────]
  Order Service        [──── 15ms ────]
  Payment Service           [────── 200ms ──────]  ← Bottleneck!
  Inventory Service                                [── 10ms ──]

  Total: 230ms → Payment Service is the problem!
```

**How it works:**
```
Request → Assign Trace ID: "abc-123"
  → Service A adds Span A (traceId: abc-123, spanId: 1)
  → Service B adds Span B (traceId: abc-123, spanId: 2, parentSpan: 1)
  → Service C adds Span C (traceId: abc-123, spanId: 3, parentSpan: 2)

All spans collected → Full trace timeline visible
```

**Tools:** Jaeger, Zipkin, AWS X-Ray, Datadog APM

### Alerting Systems

| Alert Type | Trigger | Action |
|-----------|---------|--------|
| **Critical** | Service down, error rate > 5% | Page on-call engineer immediately |
| **Warning** | Latency spike, CPU > 80% | Notify via Slack |
| **Info** | Deployment completed | Log for awareness |

**Good alerting practices:**
```
✅ Alert on symptoms (high error rate) not causes (CPU usage)
✅ Set proper thresholds to avoid alert fatigue
✅ Include runbook links in alerts
✅ Have escalation policies (if not ack'd in 10 min → escalate)
❌ Don't alert on things that auto-recover
❌ Don't alert on every single metric
```

### Monitoring Tools

| Tool | Purpose | Type |
|------|---------|------|
| **Prometheus** | Metrics collection & storage | Time-series DB |
| **Grafana** | Dashboards & visualization | UI for Prometheus/others |
| **ELK Stack** | Log aggregation & search | Elasticsearch + Logstash + Kibana |
| **Jaeger / Zipkin** | Distributed tracing | Trace collection |
| **Datadog** | All-in-one monitoring | Commercial (metrics + logs + traces) |
| **PagerDuty** | Alerting & on-call management | Incident management |

```
Typical Monitoring Stack:
  App → Prometheus (metrics) → Grafana (dashboards) → PagerDuty (alerts)
  App → Fluentd (logs) → Elasticsearch → Kibana (search & explore)
  App → Jaeger (traces) → UI (trace visualization)
```

---

## 13. Deployment & DevOps Basics

### CI/CD Pipelines

**CI** (Continuous Integration) — Automatically build & test on every code push.
**CD** (Continuous Deployment) — Automatically deploy to production after tests pass.

```
Developer pushes code
       │
       ▼
  ┌─────────┐     ┌──────────┐     ┌─────────┐     ┌────────────┐
  │  Build   │ ──→ │  Test    │ ──→ │ Stage   │ ──→ │ Production │
  │ (compile)│     │ (unit,   │     │ (deploy │     │  (deploy)  │
  │          │     │  integ.) │     │  to QA) │     │            │
  └─────────┘     └──────────┘     └─────────┘     └────────────┘
       CI                              CD
```

| Stage | What Happens | Tools |
|-------|-------------|-------|
| **Source** | Code pushed to repo | GitHub, GitLab |
| **Build** | Compile, create artifacts | Docker build, npm run build |
| **Test** | Run automated tests | Jest, pytest, JUnit |
| **Stage** | Deploy to staging environment | Same as production |
| **Deploy** | Release to production | ArgoCD, GitHub Actions |

**Tools:** GitHub Actions, GitLab CI, Jenkins, CircleCI, ArgoCD

### Containerization (Docker)

Package an app with **everything it needs** to run — code, runtime, dependencies, config.

```
Without Docker:
  "It works on my machine" 🤷
  Dev: Node 18, npm 9     Prod: Node 16, npm 7  → 💀 Breaks

With Docker:
  ┌─────────────────────────┐
  │  Docker Container       │
  │  ┌────────────────────┐ │
  │  │ Your App           │ │
  │  │ Node 18 + npm 9    │ │
  │  │ All dependencies   │ │
  │  └────────────────────┘ │
  └─────────────────────────┘
  Runs the SAME everywhere ✅
```

**Key Docker Concepts:**

| Concept | What | Analogy |
|---------|------|---------|
| **Image** | Blueprint for a container | Class |
| **Container** | Running instance of an image | Object |
| **Dockerfile** | Instructions to build an image | Recipe |
| **Volume** | Persistent storage | External hard drive |
| **Network** | Communication between containers | LAN |
| **Registry** | Storage for images | Docker Hub, ECR |

```dockerfile
# Example Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Orchestration (Kubernetes Basics)

Manages **hundreds/thousands of containers** automatically.

```
Without Kubernetes:
  "Container crashed at 3 AM" → Manual restart 😴

With Kubernetes:
  Container crashed → K8s detects → Restarts automatically ✅
  Traffic spike → K8s scales up → Adds more containers ✅
  New version → K8s rolls out gradually → Zero downtime ✅
```

**Key Concepts:**

| Concept | What | Example |
|---------|------|---------|
| **Pod** | Smallest unit — one or more containers | Your app container |
| **Node** | A machine (VM or physical) running pods | EC2 instance |
| **Cluster** | Group of nodes | Your entire infrastructure |
| **Service** | Stable network endpoint for pods | Load balancer for pods |
| **Deployment** | Manages pod replicas & updates | "Run 3 copies of my app" |
| **Namespace** | Logical separation within cluster | `dev`, `staging`, `prod` |

```
Kubernetes Cluster:
┌────────────────────────────────────────────┐
│  Node 1                    Node 2          │
│  ┌───────┐ ┌───────┐     ┌───────┐       │
│  │ Pod A │ │ Pod B │     │ Pod A │       │
│  │(app)  │ │(app)  │     │(app)  │       │
│  └───────┘ └───────┘     └───────┘       │
│  ┌───────┐                ┌───────┐       │
│  │ Pod C │                │ Pod D │       │
│  │(redis)│                │(mongo)│       │
│  └───────┘                └───────┘       │
└────────────────────────────────────────────┘
```

### Blue-Green Deployment

Run **two identical environments**. Switch traffic instantly between them.

```
Step 1: Blue is live, Green has new version
  Users ──→ [Load Balancer] ──→ Blue (v1.0) ✅ LIVE
                                Green (v2.0) 🔄 Ready

Step 2: Switch traffic to Green
  Users ──→ [Load Balancer] ──→ Blue (v1.0) (idle)
                                Green (v2.0) ✅ LIVE

Step 3: Problem? Switch back instantly!
  Users ──→ [Load Balancer] ──→ Blue (v1.0) ✅ Rollback!
                                Green (v2.0) ❌ Bug found
```

| Pros | Cons |
|------|------|
| Zero downtime deployment | Double the infrastructure cost |
| Instant rollback | Database migrations are tricky |
| Test in production-like environment | Need to keep both in sync |

### Canary Releases

Roll out to a **small percentage of users first**, then gradually increase.

```
Stage 1:  5% traffic  → New version (canary)
          95% traffic → Old version

  Monitor errors, latency...  ✅ Looks good

Stage 2:  25% traffic → New version
          75% traffic → Old version

  Monitor again...  ✅ Still good

Stage 3:  100% traffic → New version  🎉 Full rollout
```

| Strategy | Risk | Speed | When |
|----------|------|-------|------|
| **Blue-Green** | Low (instant rollback) | Instant switch | Confident in release |
| **Canary** | Very low (small exposure) | Gradual | Risky changes, large user base |
| **Rolling Update** | Medium | Gradual | Standard updates (K8s default) |

---

## 14. Approach to System Design 🔥

> This is the **most important section** for interviews. Follow this structured approach.

### Step-by-Step Framework

```
┌─────────────────────────────────────────────────────────────┐
│  1. REQUIREMENTS (5 min)                                    │
│     → Functional + Non-functional                           │
│                                                             │
│  2. ESTIMATION (5 min)                                      │
│     → Users, storage, bandwidth, QPS                        │
│                                                             │
│  3. HIGH-LEVEL DESIGN (10 min)                              │
│     → Draw major components + data flow                     │
│                                                             │
│  4. DEEP DIVE (15 min)                                      │
│     → Database schema, APIs, algorithms                     │
│                                                             │
│  5. BOTTLENECKS & TRADE-OFFS (5 min)                        │
│     → Identify weak points, discuss alternatives            │
└─────────────────────────────────────────────────────────────┘
```

### Step 1: Requirement Clarification

**Always ask questions first.** Never jump into design.

```
Functional Requirements (what the system does):
  "What are the core features?"
  "Who are the users?"
  "What are the input/output?"

Non-Functional Requirements (how the system performs):
  "How many users? (scale)"
  "What's acceptable latency?"
  "Is consistency or availability more important?"
  "What's the read:write ratio?"
```

**Example — URL Shortener:**
```
Functional:
  ✅ Shorten a long URL → short URL
  ✅ Redirect short URL → original URL
  ✅ Custom short URLs (optional)
  ✅ Expiration (optional)

Non-Functional:
  ✅ 100M URLs created per month
  ✅ 10:1 read-to-write ratio
  ✅ Low latency (< 100ms redirect)
  ✅ High availability
  ✅ Short URLs should not be guessable
```

### Step 2: Back-of-the-Envelope Estimation

Quick math to understand scale. **Don't need to be exact — order of magnitude is enough.**

**Useful numbers to memorize:**

| Metric | Value |
|--------|-------|
| Seconds in a day | ~86,400 (~100K) |
| Seconds in a month | ~2.5M |
| 1 Million (1M) | 10⁶ |
| 1 Billion (1B) | 10⁹ |
| 1 char | 1 byte |
| 1 KB | 1,000 bytes |
| 1 MB | 1,000 KB |
| 1 GB | 1,000 MB |
| 1 TB | 1,000 GB |

**Example Estimation — URL Shortener:**
```
Writes: 100M URLs / month
  = 100M / (30 × 86400) ≈ 40 URLs/sec

Reads: 10:1 ratio
  = 40 × 10 = 400 reads/sec

Storage (5 years):
  Each URL: ~500 bytes (short URL + long URL + metadata)
  100M/month × 12 × 5 = 6 Billion URLs
  6B × 500 bytes = 3 TB

Bandwidth:
  Write: 40 × 500 bytes = 20 KB/s
  Read:  400 × 500 bytes = 200 KB/s
```

### Step 3: High-Level Design

Draw the major components and how they connect.

```
Example — URL Shortener:

  Client
    │
    ▼
  [Load Balancer]
    │
    ▼
  [App Servers] ──→ [Cache (Redis)] ──→ [Database (NoSQL)]
    │
    ▼
  [URL Generation Service]
```

**Tips:**
```
✅ Start simple — add complexity as needed
✅ Show data flow direction with arrows
✅ Label each component clearly
✅ Identify read vs write paths
❌ Don't over-engineer from the start
```

### Step 4: Deep Dive

Pick key components and design in detail.

```
Database Schema:
  urls_table:
    id          (PK, auto-increment)
    short_url   (unique index, varchar 7)
    long_url    (text)
    created_at  (timestamp)
    expires_at  (timestamp, nullable)
    user_id     (FK, nullable)

API Design:
  POST /api/shorten
    Body: { "longUrl": "https://...", "customAlias": "my-link" }
    Response: { "shortUrl": "https://short.ly/abc1234" }

  GET /:shortUrl
    Response: 301 Redirect to long URL

Key Algorithm — Short URL Generation:
  Option 1: Base62 encode auto-increment ID
    ID 12345 → Base62 → "dnh"
  Option 2: MD5 hash first 7 chars
    hash("https://long-url.com") → "a3b8f2c"
  Option 3: Pre-generate random keys (KGS - Key Generation Service)
    Pool of unused keys → assign one per request
```

### Step 5: Bottlenecks & Trade-offs

```
Bottlenecks:
  ❓ Single database — what if it goes down?
     → Add read replicas + master-slave replication

  ❓ Hot URLs (viral links) — cache overwhelmed?
     → Use CDN + multi-tier caching

  ❓ Key collisions in short URL generation?
     → Use KGS with pre-generated unique keys

Trade-offs:
  SQL vs NoSQL → NoSQL for scale (billions of simple records)
  Consistency vs Availability → AP (eventual consistency is fine for redirects)
  Cache eviction → LRU (recently accessed URLs stay cached)
```

---

## 15. Case Studies

### Design URL Shortener (bit.ly)

```
Requirements: Shorten URLs, redirect, analytics, 100M URLs/month
Scale: 40 writes/s, 400 reads/s, 3 TB over 5 years

  ┌────────┐     ┌────────────┐     ┌─────────┐     ┌──────────┐
  │ Client │ ──→ │   Nginx    │ ──→ │ App     │ ──→ │ Cassandra│
  └────────┘     │  (LB+CDN)  │     │ Servers │     │ (NoSQL)  │
                 └────────────┘     └────┬────┘     └──────────┘
                                        │
                                   ┌────▼─────┐
                                   │  Redis   │
                                   │ (Cache)  │
                                   └──────────┘
Key decisions:
  ✅ NoSQL (Cassandra) — simple k-v lookups at scale
  ✅ Base62 encoding — short, URL-safe
  ✅ Redis cache — hot URLs served from memory
  ✅ 301 redirect — browser caches (less server load)
```

### Design WhatsApp / Chat System

```
Requirements: 1-on-1 chat, group chat, online status, sent/delivered/read
Scale: 2B users, 100B messages/day

  ┌────────┐   WebSocket   ┌────────────┐     ┌───────────┐
  │ Client │ ◄═══════════► │  Chat      │ ──→ │ Message   │
  └────────┘                │  Servers   │     │ Store     │
                            └─────┬──────┘     │(Cassandra)│
                                  │            └───────────┘
                            ┌─────▼──────┐
                            │ Presence   │
                            │ Service    │
                            │ (Redis)    │
                            └────────────┘
Key decisions:
  ✅ WebSocket — persistent bidirectional connection
  ✅ Cassandra — write-heavy, append-only messages
  ✅ Fan-out on read — fetch messages when user opens chat
  ✅ Message queue — deliver to offline users when they reconnect
  ✅ Separate presence service — "online" status via heartbeats
```

### Design Instagram / Feed System

```
Requirements: Post photos, follow users, news feed, likes, comments
Scale: 1B users, 500M daily active, 100M photos/day

  ┌────────┐     ┌─────┐     ┌───────────┐     ┌────────────┐
  │ Client │ ──→ │ CDN │     │ App       │ ──→ │  DB Cluster│
  └────────┘     │(imgs)│    │ Servers   │     │  (Postgres)│
                 └─────┘     └─────┬─────┘     └────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────────┐
              │ Feed     │  │ Redis    │  │ Object Store │
              │ Service  │  │ (Cache)  │  │ (S3 - imgs)  │
              └──────────┘  └──────────┘  └──────────────┘

Key decisions:
  ✅ Fan-out on write — pre-compute feed for followers on post
  ✅ Hybrid for celebrities — fan-out on read (too many followers)
  ✅ S3 + CDN — store and serve images
  ✅ Redis — cache user feeds, counter (likes)
  ✅ Sharding — by userId for even distribution
```

### Design Netflix / Video Streaming

```
Requirements: Upload video, transcode, stream, recommendations, search
Scale: 200M subscribers, 1B hours of video watched/day

  ┌────────┐     ┌─────┐     ┌───────────┐
  │ Client │ ──→ │ CDN │ ←── │ Origin    │
  └────────┘     │(Edge)│    │ Storage   │
                 └─────┘     │ (S3)     │
                              └───────────┘
                                    ↑ transcoded videos
                              ┌───────────┐
                              │ Transcode │
                              │ Pipeline  │
                              └─────┬─────┘
                                    │ upload
                              ┌───────────┐
                              │ Upload    │
                              │ Service   │
                              └───────────┘

Key decisions:
  ✅ CDN — serve videos from edge (closest server)
  ✅ Adaptive bitrate — adjust quality based on bandwidth
  ✅ Transcode to multiple formats — 480p, 720p, 1080p, 4K
  ✅ Chunk videos — stream in segments, not whole file
  ✅ Recommendation engine — ML-based collaborative filtering
```

### Design Uber / Ride Matching

```
Requirements: Request ride, match driver, real-time tracking, pricing
Scale: 100M riders, 5M drivers, 20M trips/day

  ┌────────┐     ┌────────────┐     ┌──────────────┐
  │ Rider  │ ──→ │  API       │ ──→ │ Trip         │
  │ App    │     │  Gateway   │     │ Service      │
  └────────┘     └─────┬──────┘     └──────┬───────┘
                       │                    │
  ┌────────┐          │            ┌───────▼───────┐
  │ Driver │ ──→──────┘            │ Matching      │
  │ App    │                       │ Service       │
  └────────┘                       │ (Geo-spatial) │
                                   └───────┬───────┘
                                           │
                                    ┌──────▼───────┐
                                    │ Location     │
                                    │ Service      │
                                    │ (Redis/Geo)  │
                                    └──────────────┘

Key decisions:
  ✅ Geospatial indexing — find nearby drivers (Redis GEO, QuadTree)
  ✅ WebSocket — real-time location updates
  ✅ Supply-demand pricing — surge pricing during peak
  ✅ ETA calculation — graph algorithms (Dijkstra's)
  ✅ Location updates — drivers push GPS every 3-5 seconds
```

### Design E-commerce System

```
Requirements: Browse products, cart, order, payment, search, reviews
Scale: 100M users, 10M orders/day, 500M products

  ┌────────┐     ┌────────┐     ┌──────────────────────────────────┐
  │ Client │ ──→ │  API   │ ──→ │         Microservices            │
  └────────┘     │Gateway │     │                                  │
                 └────────┘     │ ┌─────────┐  ┌───────────────┐   │
                                │ │ Product │  │ Search        │   │
                                │ │ Service │  │(Elasticsearch)│   │
                                │ └─────────┘  └───────────────┘   │
                                │ ┌─────────┐  ┌───────────────┐   │
                                │ │  Cart   │  │   Order       │   │
                                │ │(Redis)  │  │   Service     │   │
                                │ └─────────┘  └───────────────┘   │
                                │ ┌─────────┐  ┌───────────────┐   │
                                │ │ Payment │  │  Inventory    │   │
                                │ │ Service │  │  Service      │   │
                                │ └─────────┘  └───────────────┘   │
                                └──────────────────────────────────┘

Key decisions:
  ✅ Elasticsearch — full-text product search
  ✅ Redis — shopping cart (fast, ephemeral)
  ✅ Saga pattern — distributed transactions (order → payment → inventory)
  ✅ Event-driven — order placed event triggers inventory, email, analytics
  ✅ CDN — product images
  ✅ Database per service — Products (MongoDB), Orders (PostgreSQL)
```

---

## 16. Interview Tips

### How to Structure Answers

```
1. "Let me clarify the requirements first..."         (2-3 min)
2. "Let me do a quick estimation..."                  (3-5 min)
3. "Here's my high-level design..."                   (draw diagram)
4. "Let me dive deeper into [component]..."           (detail)
5. "The potential bottlenecks are... and here's how    (trade-offs)
    I'd address them..."
```

### Communication Tips

| Do | Don't |
|----|-------|
| Think out loud | Stay silent while thinking |
| Ask clarifying questions | Assume requirements |
| Discuss trade-offs | Present one solution as "the" answer |
| Draw diagrams | Describe everything verbally |
| Explain your reasoning | Just state decisions |
| Acknowledge what you don't know | Fake expertise |

### Common Mistakes

```
❌ Jumping into solution without understanding requirements
❌ Over-engineering from the start (don't add Kafka for 100 users)
❌ Ignoring non-functional requirements (scale, latency)
❌ Designing without numbers (how many users? reads? writes?)
❌ Not discussing trade-offs
❌ Trying to build a "perfect" system
❌ Focusing too much on one component
❌ Using buzzwords without understanding them
```

### Time Management (45-min interview)

```
┌──────────────────────────────────────────────┐
│  0-5 min   │ Requirements & clarification    │
│  5-10 min  │ Estimation                      │
│ 10-20 min  │ High-level design               │
│ 20-35 min  │ Deep dive (DB, API, key algo)   │
│ 35-40 min  │ Bottlenecks & scaling           │
│ 40-45 min  │ Wrap up & questions             │
└──────────────────────────────────────────────┘
```

### Trade-offs Cheatsheet

| Decision | Option A | Option B | Depends On |
|----------|----------|----------|------------|
| SQL vs NoSQL | Consistency, relations | Scale, flexibility | Data structure & scale |
| Cache vs No Cache | Fast reads | Always fresh data | Read:write ratio |
| Push vs Pull | Real-time | Less server load | Latency requirements |
| Monolith vs Microservices | Simple | Scalable | Team size & complexity |
| Consistency vs Availability | Correct data | Always responds | Business requirement |
| Batch vs Stream | Efficient | Real-time | Latency tolerance |
| Normalize vs Denormalize | Less storage, writes | Faster reads | Read vs write heavy |

---

> **Previous: [Part 2](System_Design_Part_2.md)** — API Design, Performance, Message Queues, Reliability, Security
>
> **Previous: [Part 1](System_Design_Part_1.md)** — Introduction, Fundamentals, Scalability, Caching, Databases
