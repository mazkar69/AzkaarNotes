# Nginx Rate Limiting

> Last Updated: February 22, 2026

## Table of Contents
- [Overview](#overview)
- [Basic Rate Limiting](#basic-rate-limiting)
- [Burst Handling](#burst-handling)
- [Per-Location Rate Limiting](#per-location-rate-limiting)
- [Rate Limiting by URI](#rate-limiting-by-uri)
- [Whitelisting IPs](#whitelisting-ips)
- [Custom Error Responses](#custom-error-responses)
- [Testing](#testing)

---

## Overview

Rate limiting controls how many requests a client can make in a given time period. It protects against brute-force attacks, DDoS, and API abuse.

Key concepts:
- `limit_req_zone` - defines a shared memory zone to track request rates
- `limit_req` - applies the rate limit to a location
- Rate is defined as requests per second (`r/s`) or per minute (`r/m`)

---

## Basic Rate Limiting

### Step 1 - Define Zone (in http block)

```nginx
# /etc/nginx/nginx.conf (inside http block)
# Zone: "one", Key: client IP, Size: 10MB, Rate: 10 requests/second
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
```

| Parameter | Description |
|-----------|-------------|
| `$binary_remote_addr` | Client IP address (key for tracking) |
| `zone=one:10m` | Zone named "one" with 10MB memory (~160,000 IPs) |
| `rate=10r/s` | Allow 10 requests per second per IP |

### Step 2 - Apply to Location

```nginx
server {
    location / {
        limit_req zone=one;
        proxy_pass http://localhost:5000;
    }
}
```

This strict setup rejects any request exceeding 10 r/s immediately with 503.

---

## Burst Handling

Burst allows temporary spikes above the rate limit instead of immediately rejecting.

```nginx
# Allow bursts of 20 requests, delay after rate is exceeded
location /api/ {
    limit_req zone=one burst=20;
    proxy_pass http://localhost:5000;
}
```

- Excess requests (up to 20) are queued and processed at the defined rate
- Requests beyond burst are rejected with 503

### nodelay

Process burst requests immediately instead of queuing:

```nginx
location /api/ {
    limit_req zone=one burst=20 nodelay;
    proxy_pass http://localhost:5000;
}
```

- Burst slots are consumed instantly
- Once burst slots are full, excess requests get 503
- Slots refill at the defined rate (10/s)

---

## Per-Location Rate Limiting

Apply different rates to different endpoints:

```nginx
# Define multiple zones
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

server {
    listen 80;
    server_name example.com;

    # General pages - 10 requests/second
    location / {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }

    # Login - 5 requests/minute (strict for brute-force protection)
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://localhost:5000;
    }

    # API - 30 requests/second
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

---

## Rate Limiting by URI

Track rate per URI instead of per IP (useful for protecting specific endpoints):

```nginx
# Rate limit per URI
limit_req_zone $request_uri zone=per_uri:10m rate=100r/s;

# Rate limit per IP + URI combination
limit_req_zone $binary_remote_addr$request_uri zone=per_ip_uri:10m rate=5r/s;
```

---

## Whitelisting IPs

Skip rate limiting for trusted IPs:

```nginx
# Map to set variable based on IP
geo $limit {
    default 1;
    10.0.0.0/8 0;         # Internal network
    192.168.1.0/24 0;     # Local network
    203.0.113.50 0;       # Specific trusted IP
}

map $limit $limit_key {
    0 "";                  # Empty key = no rate limiting
    1 $binary_remote_addr; # Normal IPs get rate limited
}

limit_req_zone $limit_key zone=api:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:5000;
    }
}
```

---

## Custom Error Responses

### Change Status Code

By default, rate-limited requests get 503. Change to 429 (Too Many Requests):

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;
limit_req_status 429;

server {
    location /api/ {
        limit_req zone=one burst=20 nodelay;

        # Custom error page for 429
        error_page 429 /429.json;
        location = /429.json {
            internal;
            default_type application/json;
            return 429 '{"success": false, "message": "Too many requests. Please try again later."}';
        }

        proxy_pass http://localhost:5000;
    }
}
```

### Log Rate-Limited Requests

```nginx
# Log level for rejected requests (default: error)
limit_req_log_level warn;

# Dry-run mode (log but don't reject - useful for testing)
limit_req_dry_run on;
```

---

## Testing

### Test with curl

```bash
# Send multiple requests quickly
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{http_code}\n" http://example.com/api/
done
```

### Test with Apache Bench

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 http://example.com/api/
```

### Apply and Reload

```bash
# Test config
sudo nginx -t

# Reload (no downtime)
sudo systemctl reload nginx
```

### Full Config Example

```nginx
# /etc/nginx/nginx.conf
http {
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_status 429;
    limit_req_log_level warn;

    server {
        listen 80;
        server_name example.com;

        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://localhost:3000;
        }

        location /api/auth/ {
            limit_req zone=auth burst=3 nodelay;
            proxy_pass http://localhost:5000;
        }

        location /api/ {
            limit_req zone=general burst=30 nodelay;
            proxy_pass http://localhost:5000;
        }
    }
}
```
