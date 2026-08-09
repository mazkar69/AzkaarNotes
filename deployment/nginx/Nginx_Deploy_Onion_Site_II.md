# Hosting Multiple `.onion` Sites on a Single Server

Yes, you can host multiple `.onion` websites on the same server, just like virtual hosts on the clearnet. However, the mechanism is slightly different.

---

## How It Works: Clearnet vs Tor

### Clearnet (Traditional Virtual Hosts)

```
example.com  ──┐
blog.com     ──┼──> Same Public IP ──> Nginx reads "Host" header ──> Routes to correct site
shop.com     ──┘
```

Nginx differentiates sites using the `server_name` directive based on the HTTP `Host` header.

### Tor Hidden Services

Each `.onion` address is a **separate cryptographic identity** with its own key pair. You define multiple `HiddenServiceDir` blocks in `torrc`, and Tor forwards each one to a **different local port** on your server.

```
abc123.onion  ──> Tor ──> 127.0.0.1:8001 ──> Nginx Server Block 1
xyz789.onion  ──> Tor ──> 127.0.0.1:8002 ──> Nginx Server Block 2
mno456.onion  ──> Tor ──> 127.0.0.1:8003 ──> Nginx Server Block 3
```

---

## Method 1: Different Local Ports (Recommended)

This is the cleanest and most reliable approach. Each `.onion` site gets its own local port.

### Step 1: Configure Multiple Hidden Services in Tor

```bash
sudo nano /etc/tor/torrc
```

Add multiple hidden service blocks at the bottom:

```text
# ═══════════════════════════════════════════════════════════
# Site 1: MERN Dashboard
# ═══════════════════════════════════════════════════════════
HiddenServiceDir /var/lib/tor/site_one/
HiddenServicePort 80 127.0.0.1:8001

# ═══════════════════════════════════════════════════════════
# Site 2: Blog / API
# ═══════════════════════════════════════════════════════════
HiddenServiceDir /var/lib/tor/site_two/
HiddenServicePort 80 127.0.0.1:8002

# ═══════════════════════════════════════════════════════════
# Site 3: Admin Panel
# ═══════════════════════════════════════════════════════════
HiddenServiceDir /var/lib/tor/site_three/
HiddenServicePort 80 127.0.0.1:8003
```

### Step 2: Create Directories & Set Permissions

```bash
sudo mkdir -p /var/lib/tor/site_one/
sudo mkdir -p /var/lib/tor/site_two/
sudo mkdir -p /var/lib/tor/site_three/

sudo chown -R debian-tor:debian-tor /var/lib/tor/site_one/
sudo chown -R debian-tor:debian-tor /var/lib/tor/site_two/
sudo chown -R debian-tor:debian-tor /var/lib/tor/site_three/

sudo chmod 700 /var/lib/tor/site_one/
sudo chmod 700 /var/lib/tor/site_two/
sudo chmod 700 /var/lib/tor/site_three/
```

### Step 3: Restart Tor to Generate Keys

```bash
sudo systemctl restart tor
```

Wait ~30 seconds, then retrieve all `.onion` addresses:

```bash
echo "Site 1:" && sudo cat /var/lib/tor/site_one/hostname
echo "Site 2:" && sudo cat /var/lib/tor/site_two/hostname
echo "Site 3:" && sudo cat /var/lib/tor/site_three/hostname
```

### Step 4: Configure Nginx with Multiple Server Blocks

```bash
sudo nano /etc/nginx/sites-available/multi-tor
```

```nginx
# ═══════════════════════════════════════════════════════════
# Site 1: MERN Dashboard (Port 8001)
# ═══════════════════════════════════════════════════════════
server {
    listen 127.0.0.1:8001;
    server_name _;

    root /var/www/site-one/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    server_tokens off;
}

# ═══════════════════════════════════════════════════════════
# Site 2: Blog / API (Port 8002)
# ═══════════════════════════════════════════════════════════
server {
    listen 127.0.0.1:8002;
    server_name _;

    root /var/www/site-two/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    server_tokens off;
}

# ═══════════════════════════════════════════════════════════
# Site 3: Admin Panel (Port 8003)
# ═══════════════════════════════════════════════════════════
server {
    listen 127.0.0.1:8003;
    server_name _;

    root /var/www/site-three/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    server_tokens off;
}
```

### Step 5: Enable and Restart Nginx

```bash
sudo ln -s /etc/nginx/sites-available/multi-tor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Start Each Backend on Its Own Port

```bash
# Site 1 backend (port 5001)
cd /var/www/site-one/backend
PORT=5001 pm2 start server.js --name "site-one-backend"

# Site 2 backend (port 5002)
cd /var/www/site-two/backend
PORT=5002 pm2 start server.js --name "site-two-backend"

# Site 3 backend (port 5003)
cd /var/www/site-three/backend
PORT=5003 pm2 start server.js --name "site-three-backend"

pm2 save
```

---

## Method 2: Same Port with `server_name` (Like Clearnet Virtual Hosts)

You **can** also route all hidden services to the same local port and let Nginx differentiate using the `Host` header (which contains the `.onion` address).

### Tor Config (all pointing to same port)

```text
HiddenServiceDir /var/lib/tor/site_one/
HiddenServicePort 80 127.0.0.1:80

HiddenServiceDir /var/lib/tor/site_two/
HiddenServicePort 80 127.0.0.1:80

HiddenServiceDir /var/lib/tor/site_three/
HiddenServicePort 80 127.0.0.1:80
```

### Nginx Config (using `server_name` with `.onion` addresses)

```nginx
server {
    listen 127.0.0.1:80;
    server_name abc123abcdefghijklmnopqrst.onion;

    root /var/www/site-one/frontend/build;
    # ... rest of config
}

server {
    listen 127.0.0.1:80;
    server_name xyz789abcdefghijklmnopqrst.onion;

    root /var/www/site-two/frontend/build;
    # ... rest of config
}
```

### ⚠️ Why Method 1 is Preferred

| Aspect | Method 1 (Different Ports) | Method 2 (Same Port + server_name) |
|---|---|---|
| Reliability | ✅ Guaranteed separation | ⚠️ Depends on Host header being passed correctly |
| Debugging | ✅ Easy to isolate issues | ❌ Harder to trace which site has issues |
| Security Isolation | ✅ Can run separate processes per port | ❌ Shared process handles all sites |
| Flexibility | ✅ Can use different web servers per site | ❌ Must use same web server |
| Configuration | Slightly more ports to manage | Fewer ports, but fragile |

---

## Complete Architecture Diagram (Method 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TOR NETWORK                                  │
│                                                                     │
│   abc123.onion          xyz789.onion          mno456.onion         │
│       │                     │                     │                 │
└───────┼─────────────────────┼─────────────────────┼─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      TOR DAEMON (tor)                                │
│                                                                     │
│   HiddenServiceDir      HiddenServiceDir      HiddenServiceDir      │
│   /var/lib/tor/         /var/lib/tor/         /var/lib/tor/         │
│   site_one/             site_two/             site_three/           │
│       │                     │                     │                 │
│       ▼                     ▼                     ▼                 │
│   127.0.0.1:8001       127.0.0.1:8002       127.0.0.1:8003        │
│                                                                     │
└───────┬─────────────────────┬─────────────────────┬─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NGINX                                        │
│                                                                     │
│   server {              server {              server {              │
│     listen 8001;          listen 8002;          listen 8003;        │
│     site-one              site-two              site-three          │
│   }                     }                     }                     │
│       │                     │                     │                 │
│       ▼                     ▼                     ▼                 │
│   /var/www/             /var/www/             /var/www/             │
│   site-one/             site-two/             site-three/           │
│                                                                     │
└───────┬─────────────────────┬─────────────────────┬─────────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS BACKENDS (PM2)                            │
│                                                                     │
│   Port 5001             Port 5002             Port 5003             │
│   site-one-backend      site-two-backend      site-three-backend    │
│       │                     │                     │                 │
│       ▼                     ▼                     ▼                 │
│   MongoDB             MongoDB             MongoDB                   │
│   db_one              db_two              db_three                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Adding a New Site Later

```bash
# 1. Add to torrc
echo "
HiddenServiceDir /var/lib/tor/site_four/
HiddenServicePort 80 127.0.0.1:8004
" | sudo tee -a /etc/tor/torrc

# 2. Create directory
sudo mkdir -p /var/lib/tor/site_four/
sudo chown -R debian-tor:debian-tor /var/lib/tor/site_four/
sudo chmod 700 /var/lib/tor/site_four/

# 3. Restart Tor
sudo systemctl restart tor

# 4. Get the new .onion address
sleep 10
sudo cat /var/lib/tor/site_four/hostname

# 5. Add Nginx server block for port 8004
# 6. Deploy the app to /var/www/site-four/
# 7. Start backend on port 5004 with PM2
# 8. sudo nginx -t && sudo systemctl restart nginx
```

---

## Resource Considerations

| Sites | Recommended EC2 Instance | RAM | CPU |
|---|---|---|---|
| 1–2 sites | `t3.small` | 2 GB | 2 vCPU |
| 3–5 sites | `t3.medium` | 4 GB | 2 vCPU |
| 5–10 sites | `t3.large` | 8 GB | 2 vCPU |
| 10+ sites | `t3.xlarge` or dedicated | 16+ GB | 4+ vCPU |

Each Tor hidden service maintains its own circuit to the Tor network, which consumes memory and CPU. Each Node.js/Express backend also consumes ~50–150 MB of RAM.

---

## Key Difference Summary

| Feature | Clearnet | Tor (.onion) |
|---|---|---|
| Identity | Domain name registered with ICANN | Cryptographic key pair (no registration) |
| Routing | DNS → IP → Nginx `server_name` | Tor circuit → Local port → Nginx |
| Multiple sites | Same IP, different `Host` header | Different `HiddenServiceDir`, different local ports |
| SSL/HTTPS | Required (Let's Encrypt) | Not needed (Tor encrypts natively) |
| Adding a new site | Buy domain + DNS + Nginx config | Generate keys + torrc + Nginx config |
| Cost per site | Domain registration fee | Free (just compute resources) |