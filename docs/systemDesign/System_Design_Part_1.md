# System Design — Part 1: Foundations & Data

> Covers: Introduction, Fundamentals, Scalability, Caching, Storage & Databases

---

## Table of Contents

- [1. Introduction](#1-introduction)
- [2. System Design Fundamentals](#2-system-design-fundamentals)
- [3. Scalability](#3-scalability)
- [4. Caching](#4-caching)
- [5. Storage & Databases](#5-storage--databases)

---

## 1. Introduction

### What is System Design?

System Design is the process of defining the **architecture, components, modules, and data flow** of a system to satisfy specified requirements. It's about making decisions on how different pieces of software and hardware work together.

```
User Request → Load Balancer → App Server → Database
                                    ↓
                                  Cache
```

### Why System Design Matters

| Reason | Impact |
|--------|--------|
| **Handles Growth** | System survives when users go from 100 → 10 million |
| **Prevents Downtime** | Good design = high availability |
| **Cost Efficiency** | Right architecture saves money at scale |
| **Team Collaboration** | Clear structure helps teams work independently |

### Types of Systems

| Feature | Monolith | Distributed |
|---------|----------|-------------|
| Deployment | Single unit | Multiple services |
| Scaling | Scale everything together | Scale individual parts |
| Complexity | Simple to start | Complex but flexible |
| Failure | One failure = all down | Partial failures possible |
| Best For | Small apps, MVPs | Large-scale production apps |

### High-Level vs Low-Level Design

| Aspect | High-Level Design (HLD) | Low-Level Design (LLD) |
|--------|--------------------------|------------------------|
| Focus | Architecture, components | Classes, functions, schemas |
| Scope | Bird's eye view | Zoom into one component |
| Example | "Use a message queue between services" | "Queue class with enqueue/dequeue methods" |
| Audience | Architects, leads | Developers |

---

## 2. System Design Fundamentals

### Functional vs Non-Functional Requirements

**Functional** — What the system **does**
**Non-Functional** — How the system **performs**

```
Example: Twitter

Functional:
  ✅ User can post a tweet
  ✅ User can follow other users
  ✅ User sees a timeline feed

Non-Functional:
  ✅ Feed loads in < 200ms
  ✅ 99.9% uptime
  ✅ Support 500M users
```

### CAP Theorem

> In a distributed system, you can only guarantee **2 out of 3**:

```
        Consistency
           /\
          /  \
         /    \
        /  Pick \
       /   Two   \
      /____________\
Availability    Partition
                Tolerance
```

| Property | Meaning | Example |
|----------|---------|---------|
| **C** — Consistency | Every read gets the latest write | Banking systems |
| **A** — Availability | Every request gets a response | Social media feeds |
| **P** — Partition Tolerance | System works despite network splits | Any distributed system |

**Common Choices:**
- **CP** — Consistency + Partition Tolerance → MongoDB, Redis
- **AP** — Availability + Partition Tolerance → Cassandra, DynamoDB
- **CA** — Not practical in distributed systems (network failures always happen)

### ACID vs BASE

| Property | ACID (SQL) | BASE (NoSQL) |
|----------|-----------|--------------|
| Focus | Strong consistency | High availability |
| **A** | Atomicity — all or nothing | Basically Available |
| **C/S** | Consistency — valid state always | Soft state — may change over time |
| **I/E** | Isolation — transactions don't interfere | Eventually consistent |
| **D** | Durability — committed = saved | — |
| Best For | Banking, orders | Social feeds, analytics |

### Latency vs Throughput

```
Latency    = Time to complete ONE request (ms)
Throughput = Number of requests handled per second (RPS)
```

| Metric | Analogy | Goal |
|--------|---------|------|
| Latency | How fast a single car gets from A → B | Lower is better |
| Throughput | How many cars pass through per hour | Higher is better |

**Common Latency Numbers:**
| Operation | Time |
|-----------|------|
| L1 cache reference | ~1 ns |
| RAM reference | ~100 ns |
| SSD read | ~150 μs |
| HDD read | ~10 ms |
| Network round trip (same region) | ~0.5 ms |
| Network round trip (cross-continent) | ~150 ms |

### Scalability

| Type | How | Pros | Cons |
|------|-----|------|------|
| **Vertical** (Scale Up) | Bigger machine (more CPU/RAM) | Simple, no code change | Hardware limit, single point of failure |
| **Horizontal** (Scale Out) | More machines | No hardware limit, fault tolerant | Complex, needs load balancing |

```
Vertical:    [ Small Server ] → [ BIGGER Server ]

Horizontal:  [ Server ] → [ Server ] + [ Server ] + [ Server ]
                              ↑ Load Balancer distributes traffic
```

### Availability & Reliability

| Term | Meaning |
|------|---------|
| **Availability** | % of time system is operational |
| **Reliability** | Probability system works correctly over time |

**The "Nines" Table:**
| Availability | Downtime/Year | Downtime/Month |
|-------------|---------------|----------------|
| 99% (two 9s) | 3.65 days | 7.3 hours |
| 99.9% (three 9s) | 8.76 hours | 43.8 min |
| 99.99% (four 9s) | 52.6 min | 4.38 min |
| 99.999% (five 9s) | 5.26 min | 26.3 sec |

### Consistency Models

| Model | Behavior | Example |
|-------|----------|---------|
| **Strong** | Read always returns latest write | Bank balance |
| **Eventual** | Read may return stale data, but will catch up | Social media likes count |
| **Weak** | No guarantee when data will be consistent | Live video view count |

---

## 3. Scalability

### Load Handling Strategies

```
              ┌──────────────┐
   Users ───→ │ Load Balancer │
              └──────┬───────┘
           ┌─────────┼─────────┐
           ▼         ▼         ▼
       [Server1] [Server2] [Server3]
           │         │         │
           └─────────┼─────────┘
                     ▼
               [ Database ]
```

### Horizontal Scaling

Adding more machines to handle increased load.

**Key Requirements:**
- Stateless application servers (no session stored locally)
- Shared storage for state (Redis, database)
- Load balancer to distribute traffic

```
Before:  1 server handling 1000 RPS (struggling)
After:   4 servers handling 250 RPS each (comfortable)
```

### Load Balancers

Distributes incoming traffic across multiple servers.

| Type | Layer | What It Sees | Speed | Use Case |
|------|-------|-------------|-------|----------|
| **L4** | Transport (TCP/UDP) | IP + Port | Faster | Simple routing, high throughput |
| **L7** | Application (HTTP) | URL, headers, cookies | Slower | Smart routing, A/B testing |

**Load Balancing Algorithms:**
| Algorithm | How It Works |
|-----------|-------------|
| **Round Robin** | Server 1 → 2 → 3 → 1 → 2 → ... |
| **Weighted Round Robin** | More powerful servers get more requests |
| **Least Connections** | Send to server with fewest active connections |
| **IP Hash** | Same client IP always goes to same server |
| **Random** | Pick a random server |

**Tools:** Nginx, HAProxy, AWS ALB/NLB, Cloudflare

### Auto-Scaling

Automatically adds/removes servers based on demand.

```
Low Traffic (night):     [Server1] [Server2]
High Traffic (day):      [Server1] [Server2] [Server3] [Server4] [Server5]
Traffic Spike (sale):    [Server1] ... [Server10]
```

| Policy | Trigger | Action |
|--------|---------|--------|
| **Scale Out** | CPU > 70% for 5 min | Add 2 instances |
| **Scale In** | CPU < 30% for 10 min | Remove 1 instance |
| **Scheduled** | Every Friday 6 PM | Add 3 instances |

### Stateless vs Stateful Services

| Aspect | Stateless | Stateful |
|--------|-----------|----------|
| Session data | Stored externally (Redis, DB) | Stored on the server |
| Scaling | Easy — any server can handle any request | Hard — user stuck to one server |
| Failure recovery | Simple — retry on any server | Complex — session lost if server dies |
| Example | REST APIs | WebSocket connections |

```
Stateful:   User A ──always──→ Server 1 (session stored here)
Stateless:  User A ──any──→ Server 1/2/3 (session in Redis)
```

### CDN (Content Delivery Network)

Serves static content from servers **geographically close** to the user.

```
Without CDN:
  User (India) ───5000 km───→ Origin Server (US) → Response (slow)

With CDN:
  User (India) ───50 km───→ CDN Edge (Mumbai) → Response (fast!)
```

**What CDNs Cache:**
- Images, CSS, JS files
- Videos and media
- Static HTML pages
- API responses (sometimes)

**Popular CDNs:** CloudFront (AWS), Cloudflare, Akamai, Fastly

### Rate Limiting

Controls how many requests a user/IP can make in a given time.

| Algorithm | How It Works | Best For |
|-----------|-------------|----------|
| **Token Bucket** | Tokens refill at fixed rate; request costs 1 token | Allows short bursts |
| **Sliding Window** | Count requests in a rolling time window | Smooth limiting |
| **Fixed Window** | Count requests in fixed intervals (e.g., per minute) | Simple to implement |
| **Leaky Bucket** | Requests processed at constant rate; excess queued | Constant output rate |

```
Example: 100 requests/minute per user

Request #1-100:   ✅ Allowed
Request #101:     ❌ 429 Too Many Requests
After 1 minute:   Counter resets
```

---

## 4. Caching

### Why Caching is Needed

```
Without Cache:  User → Server → Database (100ms)
With Cache:     User → Server → Cache (2ms) ✅ Hit!
                                  ↓ Miss
                               Database (100ms)
```

| Problem | Without Cache | With Cache |
|---------|--------------|------------|
| DB overload | Every request hits DB | Only cache misses hit DB |
| Slow responses | Always fetching from disk | Memory-speed responses |
| Repeated work | Same computation every time | Compute once, cache result |

### Cache Types

| Cache Type | Location | What It Caches | Example |
|------------|----------|---------------|---------|
| **Client Cache** | Browser | HTML, CSS, JS, images | Browser cache, Service Worker |
| **CDN Cache** | Edge servers | Static assets, pages | CloudFront, Cloudflare |
| **Server Cache** | App server | API responses, computed data | Redis, Memcached |
| **Database Cache** | DB layer | Query results | MySQL Query Cache |

```
User → [Browser Cache] → [CDN Cache] → [App Server Cache] → [DB Cache] → DB
         Layer 1            Layer 2         Layer 3            Layer 4
```

### Cache Eviction Policies

When cache is full, which item to remove?

| Policy | Rule | Best For |
|--------|------|----------|
| **LRU** (Least Recently Used) | Remove item not accessed longest | General purpose (most common) |
| **LFU** (Least Frequently Used) | Remove item accessed fewest times | Items with varying popularity |
| **FIFO** (First In First Out) | Remove oldest item | Simple, time-based |
| **TTL** (Time To Live) | Remove after expiry time | Data that changes regularly |

```
Cache: [A, B, C, D, E] ← Full!  New item F arrives.

LRU: Remove A (least recently accessed)
LFU: Remove C (accessed only 2 times vs others 10+)
FIFO: Remove A (entered first)
```

### Cache Invalidation Strategies

How to keep cache data **in sync** with the source.

| Strategy | When to Invalidate |
|----------|--------------------|
| **Time-based (TTL)** | Cache expires after N seconds |
| **Event-based** | Invalidate when data changes (write/update/delete) |
| **Version-based** | New version = new cache key (`user_v2`) |

### Write Strategies

| Strategy | Flow | Pros | Cons |
|----------|------|------|------|
| **Write-Through** | Write to cache AND DB simultaneously | Strong consistency | Higher write latency |
| **Write-Back** | Write to cache first, DB later (async) | Fast writes | Risk of data loss if cache crashes |
| **Write-Around** | Write to DB only, cache on read | No cache pollution | Cache miss on first read |

```
Write-Through:   App → Cache + DB (at same time)
Write-Back:      App → Cache → (later) → DB
Write-Around:    App → DB (cache updated on next read)
```

### Caching Tools

| Tool | Type | Best For |
|------|------|----------|
| **Redis** | In-memory key-value store | Sessions, leaderboards, pub/sub |
| **Memcached** | In-memory key-value store | Simple caching, large data |

| Feature | Redis | Memcached |
|---------|-------|-----------|
| Data structures | Strings, Lists, Sets, Hashes, Sorted Sets | Strings only |
| Persistence | Yes (optional) | No |
| Pub/Sub | Yes | No |
| Clustering | Yes | Client-side only |
| Use when | Need rich features | Need simple speed |

---

## 5. Storage & Databases

### SQL Databases (Relational)

Data stored in **tables** with **rows and columns**, linked by relationships.

```
┌─────────────────────────┐        ┌──────────────────────────┐
│        users            │        │         orders           │
├─────┬───────┬───────────┤        ├─────┬────────┬───────────┤
│ id  │ name  │ email     │        │ id  │ user_id│ total     │
├─────┼───────┼───────────┤        ├─────┼────────┼───────────┤
│ 1   │ Ali   │ ali@x.com │◄───────│ 101 │ 1      │ $50.00   │
│ 2   │ Sara  │ sara@x.com│◄───────│ 102 │ 2      │ $30.00   │
└─────┴───────┴───────────┘        └─────┴────────┴───────────┘
```

**Popular SQL DBs:** PostgreSQL, MySQL, SQLite, MS SQL Server

#### Indexing

An index is like a **book's table of contents** — helps find data without scanning every row.

```
Without Index:  Scan all 10M rows to find user "Ali"       → Slow
With Index:     Jump directly to "Ali" using B-Tree index   → Fast
```

| Index Type | Use Case |
|-----------|----------|
| **Primary Key** | Unique row identifier (auto-created) |
| **Single Column** | Queries filtering on one column |
| **Composite** | Queries filtering on multiple columns |
| **Unique** | Enforce no duplicate values |

> **Trade-off:** Indexes speed up **reads** but slow down **writes** (index must be updated)

#### Joins & Normalization

**Normalization** — Splitting data into multiple tables to reduce redundancy.

| Normal Form | Rule | Example |
|-------------|------|---------|
| **1NF** | No repeating groups, atomic values | Split "tags" column into separate rows |
| **2NF** | 1NF + no partial dependency | Move product info to separate table |
| **3NF** | 2NF + no transitive dependency | Move city/state to address table |

**Denormalization** — Combining tables back for **read performance** (used in read-heavy systems).

```
Normalized (3 queries):     users → orders → products
Denormalized (1 query):     orders_with_details (all in one table)
```

### NoSQL Databases

| Type | Structure | Example DB | Use Case |
|------|----------|------------|----------|
| **Key-Value** | `key → value` | Redis, DynamoDB | Sessions, caching, config |
| **Document** | JSON-like documents | MongoDB, CouchDB | User profiles, catalogs, CMS |
| **Column** | Column families | Cassandra, HBase | Time-series, analytics |
| **Graph** | Nodes + Edges | Neo4j, ArangoDB | Social networks, recommendations |

```
Key-Value:    "user:123" → { name: "Ali", age: 25 }

Document:     {
                _id: "123",
                name: "Ali",
                orders: [{ item: "Book", price: 15 }]
              }

Column:       Row Key → { cf1: {col1: val, col2: val}, cf2: {col3: val} }

Graph:        (Ali) ──FRIENDS_WITH──→ (Sara)
              (Ali) ──PURCHASED──→ (Book)
```

### SQL vs NoSQL — When to Use

| Factor | SQL | NoSQL |
|--------|-----|-------|
| Data structure | Fixed schema | Flexible schema |
| Relationships | Complex joins | Embedded/denormalized |
| Scaling | Vertical (mostly) | Horizontal (built-in) |
| Consistency | Strong (ACID) | Eventual (BASE) |
| Best for | Banking, ERP, complex queries | Real-time apps, big data, IoT |

### Advanced Database Concepts

#### Sharding (Horizontal Partitioning)

Splitting data across multiple database servers.

```
All Users in ONE DB:          Sharded across 3 DBs:

┌──────────────┐             ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Users 1-900K │             │Users A-I │ │Users J-R │ │Users S-Z │
└──────────────┘             │ Shard 1  │ │ Shard 2  │ │ Shard 3  │
     (slow)                  └──────────┘ └──────────┘ └──────────┘
                                          (fast, parallel)
```

| Shard Strategy | How | Pros | Cons |
|----------------|-----|------|------|
| **Range-based** | A-I → Shard 1, J-R → Shard 2 | Simple | Uneven distribution |
| **Hash-based** | hash(userId) % 3 → Shard N | Even distribution | Hard to add shards |
| **Directory-based** | Lookup table maps key → shard | Flexible | Lookup table is bottleneck |

#### Replication

Copying data across multiple servers for **availability** and **read performance**.

```
           ┌──────────┐
  Writes → │  Master  │
           └────┬─────┘
          ┌─────┼─────┐
          ▼     ▼     ▼
      [Replica] [Replica] [Replica]  ← Reads distributed here
```

| Type | How | Use Case |
|------|-----|----------|
| **Master-Slave** | One master (writes), multiple slaves (reads) | Read-heavy workloads |
| **Multi-Master** | Multiple masters (all accept writes) | Write-heavy, multi-region |
| **Peer-to-Peer** | All nodes equal | Decentralized systems |

#### Database Scaling Summary

```
Step 1: Optimize queries + add indexes
Step 2: Add read replicas (handle more reads)
Step 3: Add caching layer (reduce DB hits)
Step 4: Vertical scaling (bigger machine)
Step 5: Sharding (split data across machines)
```

---

> **Next: [Part 2](System_Design_Part_2.md)** — API Design, Performance, Message Queues, Reliability & Security
