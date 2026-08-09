# Complete Guide: Hosting a Tor Hidden Service (.onion Site)

> **Reference Document** — How Tor Hidden Services Work, Setup, Deployment, and Security

---

## Table of Contents

1. [How Tor Hidden Services Work](#1-how-tor-hidden-services-work)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites](#3-prerequisites)
4. [Step 1: Launch AWS EC2 Instance](#4-step-1-launch-aws-ec2-instance)
5. [Step 2: Connect & Update Server](#5-step-2-connect--update-server)
6. [Step 3: Install System Dependencies](#6-step-3-install-system-dependencies)
7. [Step 4: Install Node.js & PM2](#7-step-4-install-nodejs--pm2)
8. [Step 5: Install MongoDB](#8-step-5-install-mongodb)
9. [Step 6: Deploy the MERN Application](#9-step-6-deploy-the-mern-application)
10. [Step 7: Configure Nginx as Reverse Proxy](#10-step-7-configure-nginx-as-reverse-proxy)
11. [Step 8: Install & Configure Tor](#11-step-8-install--configure-tor)
12. [Step 9: Start Tor & Retrieve .onion Address](#12-step-9-start-tor--retrieve-onion-address)
13. [Step 10: Security Hardening](#13-step-10-security-hardening)
14. [Step 11: Testing the Hidden Service](#14-step-11-testing-the-hidden-service)
15. [Step 12: Backup & Maintenance](#15-step-12-backup--maintenance)
16. [Troubleshooting](#16-troubleshooting)
17. [Common Mistakes & How to Avoid Them](#17-common-mistakes--how-to-avoid-them)
18. [Full Command Reference](#18-full-command-reference)

---

## 1. How Tor Hidden Services Work

### 1.1 The Problem Tor Solves

On the normal internet (clearnet), when a user visits `example.com`:

```
User Browser → DNS Lookup → Public IP Address → Server
```

The server's **real IP address** is exposed. Anyone can find where the server is physically located.

### 1.2 The Tor Solution

A Tor Hidden Service (`.onion` site) **never exposes the server's real IP address**. Instead, both the client and the server connect to the Tor network anonymously, and Tor creates a secure tunnel between them.

### 1.3 The Cryptographic Identity

- A `.onion` address is **not registered** anywhere. It is mathematically derived from a **public key**.
- The `private_key` file is the **only proof of ownership**.
- There is no central authority, no domain registrar, no DNS record.

```
Private Key → Public Key → SHA-3 Hash → Base32 Encode → .onion address
```

**Example:**
```
Private Key (ed25519) → Public Key → Hash → "v2zq7abcdefg...xyz.onion"
```

### 1.4 The Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TOR HIDDEN SERVICE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐         ┌──────────────────┐         ┌─────────┐ │
│  │  CLIENT  │         │   TOR NETWORK    │         │ SERVER  │ │
│  │ (Tor     │         │  (Relays &       │         │ (Your   │ │
│  │ Browser) │         │  Directory Auth) │         │ EC2)    │ │
│  └────┬─────┘         └────────┬─────────┘         └────┬────┘ │
│       │                        │                         │      │
│       │ 1. Client wants to     │                         │      │
│       │    visit .onion        │                         │      │
│       │───────────────────────>│                         │      │
│       │                        │                         │      │
│       │                        │  2. Server makes        │      │
│       │                        │     OUTBOUND connection │      │
│       │                        │<────────────────────────│      │
│       │                        │     to Tor network      │      │
│       │                        │                         │      │
│       │ 3. Tor builds a       │                         │      │
│       │    circuit through     │                         │      │
│       │    6 relays (3 from   │                         │      │
│       │    client, 3 from     │                         │      │
│       │    server) meeting     │                         │      │
│       │    at a Rendezvous    │                         │      │
│       │    Point              │                         │      │
│       │<──────────────────────>│<────────────────────────>│      │
│       │                        │                         │      │
│       │ 4. Encrypted traffic  │                         │      │
│       │    flows through the  │                         │      │
│       │    circuit            │                         │      │
│       │<══════════════════════>│<════════════════════════>│      │
│       │                        │                         │      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.5 Key Concepts

| Concept | Explanation |
|---|---|
| **Guard Node** | First relay in the circuit. Both client and server pick one. |
| **Middle Relay** | Intermediate relays that only know adjacent nodes. |
| **Rendezvous Point** | The relay where client's circuit and server's circuit meet. |
| **Introduction Point** | A relay the server publishes so clients can find it. |
| **Directory Authority** | 9 special servers that maintain the Tor network consensus. |
| **HiddenServiceDir** | Local directory storing keys and hostname for the `.onion` site. |
| **No Exit Node** | Hidden services do NOT use exit nodes. Traffic stays inside Tor. |

### 1.6 Why No Inbound Ports Are Needed

This is the most critical concept:

```
Traditional Web Server:
  Internet ──INBOUND──> Server (Port 80/443 must be OPEN)

Tor Hidden Service:
  Server ──OUTBOUND──> Tor Network (Server initiates the connection)
  Tor Network ──> Server (Traffic comes back through the tunnel)
```

**The server makes an OUTBOUND connection to Tor.** Tor handles all routing. You do **NOT** need to open ports 80, 443, or any web port in your firewall.

---

## 2. Architecture Overview

### 2.1 Full Stack Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS EC2 (Ubuntu)                     │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    TOR DAEMON                         │  │
│  │  - Connects to Tor network (outbound)                │  │
│  │  - Receives .onion traffic                            │  │
│  │  - Forwards to 127.0.0.1:80                          │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │ (localhost only)                  │
│                         ▼                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   NGINX (Port 80)                     │  │
│  │  - Listens ONLY on 127.0.0.1:80                      │  │
│  │  - Serves React static files                          │  │
│  │  - Proxies /api/* to Express backend                  │  │
│  └──────────┬────────────────────────┬───────────────────┘  │
│             │                        │                      │
│             ▼                        ▼                      │
│  ┌──────────────────┐    ┌───────────────────────────────┐  │
│  │  REACT FRONTEND  │    │   EXPRESS BACKEND (Node.js)   │  │
│  │  /var/www/app/   │    │   Port 5000 (localhost)       │  │
│  │  frontend/build/ │    │   Managed by PM2              │  │
│  └──────────────────┘    └──────────────┬────────────────┘  │
│                                         │                   │
│                                         ▼                   │
│                          ┌───────────────────────────────┐  │
│                          │   MONGODB (Port 27017)        │  │
│                          │   localhost only              │  │
│                          └───────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Port Binding Strategy

| Service | Port | Bind Address | Accessible From |
|---|---|---|---|
| Tor Daemon | 9050 (SOCKS) | 127.0.0.1 | Local only |
| Nginx | 80 | **127.0.0.1** | Local only (Tor) |
| Express/Node | 5000 | 127.0.0.1 | Local only (Nginx) |
| MongoDB | 27017 | 127.0.0.1 | Local only (Express) |
| SSH | 22 | 0.0.0.0 | Your IP only |

> ⚠️ **CRITICAL:** Nginx must bind to `127.0.0.1`, NOT `0.0.0.0`. If Nginx binds to `0.0.0.0`, your site is accessible via the public IP, defeating the purpose of Tor.

---

## 3. Prerequisites

Before starting, ensure you have:

- [ ] An AWS account with EC2 access
- [ ] An SSH key pair (`.pem` file) downloaded
- [ ] A MERN project repository (GitHub/GitLab)
- [ ] Tor Browser installed on your local machine (for testing)
- [ ] Basic Linux command-line knowledge

---

## 4. Step 1: Launch AWS EC2 Instance

### 4.1 Create the Instance

1. Go to **AWS Console → EC2 → Launch Instance**
2. **Name:** `tor-mern-server`
3. **AMI:** Ubuntu Server 22.04 LTS (or 24.04 LTS) — 64-bit (x86)
4. **Instance Type:** `t2.micro` (free tier) or `t3.small` (recommended for MERN)
5. **Key Pair:** Select or create a key pair. Download the `.pem` file.

### 4.2 Configure Security Group (CRITICAL)

```
┌─────────────────────────────────────────────────────────┐
│              SECURITY GROUP RULES                       │
├──────────┬──────┬───────────────┬───────────────────────┤
│ Type     │ Port │ Source        │ Reason                │
├──────────┼──────┼───────────────┼───────────────────────┤
│ SSH      │ 22   │ Your IP/32    │ Server administration │
├──────────┼──────┼───────────────┼───────────────────────┤
│ (NONE)   │ 80   │ DO NOT ADD    │ Nginx is local only   │
│ (NONE)   │ 443  │ DO NOT ADD    │ Not needed for Tor    │
│ (NONE)   │ 5000 │ DO NOT ADD    │ Express is local only │
│ (NONE)   │ 27017│ DO NOT ADD    │ MongoDB is local only │
└──────────┴──────┴───────────────┴───────────────────────┘
```

> 🔒 **ONLY open Port 22 (SSH).** Do NOT open any other inbound ports. Tor hidden services use outbound connections only.

### 4.3 Storage & Launch

- **Storage:** 20 GB gp3 (minimum for Node.js + MongoDB)
- Click **Launch Instance**
- Wait for the instance to reach `Running` state
- Note the **Public IPv4 address**

---

## 5. Step 2: Connect & Update Server

### 5.1 Set Permissions on Key File

```bash
# On your LOCAL machine
chmod 400 /path/to/your-key.pem
```

### 5.2 SSH into the Server

```bash
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### 5.3 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt autoremove -y
sudo apt autoclean -y
```

### 5.4 Set the System Timezone (Optional but Recommended)

```bash
sudo timedatectl set-timezone UTC
```

> Using UTC avoids timezone-based fingerprinting.

---

## 6. Step 3: Install System Dependencies

```bash
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    tor \
    ufw \
    fail2ban \
    unattended-upgrades \
    software-properties-common \
    gnupg
```

### Verify Installations

```bash
nginx -v
tor --version
git --version
```

---

## 7. Step 4: Install Node.js & PM2

### 7.1 Install Node.js (LTS via NodeSource)

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### 7.2 Verify Node.js Installation

```bash
node -v    # Should show v20.x.x
npm -v     # Should show 10.x.x
```

### 7.3 Install PM2 (Process Manager)

PM2 keeps your Express backend running as a background daemon and auto-restarts it if it crashes.

```bash
sudo npm install -g pm2
pm2 -v
```

---

## 8. Step 5: Install MongoDB

### 8.1 Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org
```

### 8.2 Start & Enable MongoDB

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 8.3 Verify MongoDB is Bound to Localhost

```bash
sudo ss -tlnp | grep 27017
```

Expected output:
```
LISTEN  0  4096  127.0.0.1:27017  0.0.0.0:*  users:(("mongod",pid=1234,fd=11))
```

> ✅ It must show `127.0.0.1:27017`, NOT `0.0.0.0:27017`.

### 8.4 Create a Database User (Security)

```bash
mongosh
```

Inside the MongoDB shell:

```javascript
use admin
db.createUser({
  user: "mernAdmin",
  pwd: "YOUR_STRONG_PASSWORD_HERE",
  roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
})

use mern_database
db.createUser({
  user: "mernUser",
  pwd: "ANOTHER_STRONG_PASSWORD_HERE",
  roles: [{ role: "readWrite", db: "mern_database" }]
})

exit
```

### 8.5 Enable MongoDB Authentication

```bash
sudo nano /etc/mongod.conf
```

Find and modify the `security` section:

```yaml
security:
  authorization: enabled

net:
  port: 27017
  bindIp: 127.0.0.1    # Ensure this is localhost only
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

---

## 9. Step 6: Deploy the MERN Application

### 9.1 Create the Application Directory

```bash
sudo mkdir -p /var/www/mern-app
sudo chown -R ubuntu:ubuntu /var/www/mern-app
cd /var/www/mern-app
```

### 9.2 Clone Your Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_MERN_PROJECT.git .
```

### 9.3 Backend Setup

```bash
cd /var/www/mern-app/backend

# Install dependencies
npm install --production

# Create environment file
nano .env
```

**Example `.env` file:**

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://mernUser:ANOTHER_STRONG_PASSWORD_HERE@127.0.0.1:27017/mern_database
JWT_SECRET=your_super_secret_jwt_key_change_this
```

> ⚠️ **IMPORTANT:** The `MONGODB_URI` must point to `127.0.0.1`, not a public hostname.

### 9.4 Start the Backend with PM2

```bash
pm2 start server.js --name "mern-backend"
pm2 save
```

### 9.5 Configure PM2 to Start on Boot

```bash
pm2 startup
# Copy and run the command that PM2 outputs
```

### 9.6 Frontend Setup (React Build)

```bash
cd /var/www/mern-app/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

> ⚠️ **IMPORTANT:** In your React code, API calls must use **relative paths**:
> ```javascript
> // ✅ CORRECT - works over .onion
> fetch('/api/users')
>
> // ❌ WRONG - will break over .onion
> fetch('http://localhost:5000/api/users')
> fetch('http://your-ec2-ip:5000/api/users')
> ```

### 9.7 Set Correct Permissions

```bash
sudo chown -R www-data:www-data /var/www/mern-app/frontend/build
sudo chmod -R 755 /var/www/mern-app/frontend/build
```

---

## 10. Step 7: Configure Nginx as Reverse Proxy

### 10.1 Remove Default Site

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 10.2 Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/mern-tor
```

Paste the following configuration:

```nginx
server {
    # ═══════════════════════════════════════════════════════════
    # CRITICAL: Listen ONLY on localhost (127.0.0.1)
    # This ensures the site is ONLY accessible via Tor.
    # If you use 0.0.0.0, the site will be exposed publicly.
    # ═══════════════════════════════════════════════════════════
    listen 127.0.0.1:80;
    server_name _;

    # React Frontend - Static Files
    root /var/www/mern-app/frontend/build;
    index index.html;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # Serve React App (SPA routing support)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Express backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Block access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Disable server tokens (hide Nginx version)
    server_tokens off;
}
```

### 10.3 Enable the Site

```bash
sudo ln -s /etc/nginx/sites-available/mern-tor /etc/nginx/sites-enabled/
```

### 10.4 Test and Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 10.5 Verify Nginx is Bound to Localhost Only

```bash
sudo ss -tlnp | grep :80
```

Expected output:
```
LISTEN  0  511  127.0.0.1:80  0.0.0.0:*  users:(("nginx",pid=5678,fd=6))
```

> ✅ Must show `127.0.0.1:80`. If it shows `0.0.0.0:80`, your site is publicly exposed.

---

## 11. Step 8: Install & Configure Tor

### 11.1 Tor is Already Installed

Tor was installed in Step 3. Verify:

```bash
tor --version
sudo systemctl status tor
```

### 11.2 Configure the Hidden Service

```bash
sudo nano /etc/tor/torrc
```

Scroll to the bottom and add the following lines:

```text
# ═══════════════════════════════════════════════════════════
# Tor Hidden Service Configuration
# ═══════════════════════════════════════════════════════════

# Directory where Tor stores the keys and hostname for this service
HiddenServiceDir /var/lib/tor/mern_hidden_service/

# Map port 80 of the .onion address to Nginx on localhost:80
HiddenServicePort 80 127.0.0.1:80

# (Optional) Number of introduction points for redundancy
HiddenServiceNumIntroductionPoints 3

# (Optional) Tor SOCKS proxy (for making outbound requests through Tor)
SOCKSPort 127.0.0.1:9050
```

### 11.3 Create the Hidden Service Directory

```bash
sudo mkdir -p /var/lib/tor/mern_hidden_service/
sudo chown -R debian-tor:debian-tor /var/lib/tor/mern_hidden_service/
sudo chmod 700 /var/lib/tor/mern_hidden_service/
```

### 11.4 Validate Tor Configuration

```bash
sudo tor --verify-config
```

Expected output:
```
Configuration was valid
```

---

## 12. Step 9: Start Tor & Retrieve .onion Address

### 12.1 Restart Tor

```bash
sudo systemctl restart tor
sudo systemctl enable tor
```

### 12.2 Wait for Tor to Generate Keys

Wait approximately 10–30 seconds for Tor to generate the cryptographic keys and register with the Tor directory authorities.

### 12.3 Retrieve the .onion Address

```bash
sudo cat /var/lib/tor/mern_hidden_service/hostname
```

Output will look like:
```
v2zq7abcdefghijklmnopqrstuvwxzy1234567890abcdef.onion
```

> 🎉 **This is your dark web address!** Copy it. You can now access your MERN app using the Tor Browser.

### 12.4 Verify the Directory Contents

```bash
sudo ls -la /var/lib/tor/mern_hidden_service/
```

Expected output:
```
drwx------  2 debian-tor debian-tor 4096 ...  ./
drwxr-xr-x 14 debian-tor debian-tor 4096 ...  ../
-rw-------  1 debian-tor debian-tor   33 ...  hostname
-rw-------  1 debian-tor debian-tor   64 ...  hs_ed25519_public_key
-rw-------  1 debian-tor debian-tor   96 ...  hs_ed25519_secret_key
```

| File | Purpose |
|---|---|
| `hostname` | Your `.onion` address (public) |
| `hs_ed25519_public_key` | Public key (derives the .onion address) |
| `hs_ed25519_secret_key` | **PRIVATE KEY — NEVER SHARE THIS** |

---

## 13. Step 10: Security Hardening

### 13.1 Configure UFW Firewall

```bash
# Reset any existing rules
sudo ufw --force reset

# Allow SSH (ONLY from your IP for maximum security)
sudo ufw allow from YOUR_HOME_IP/32 to any port 22 proto tcp

# Deny everything else by default
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Enable the firewall
sudo ufw enable
sudo ufw status verbose
```

Expected output:
```
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    YOUR_HOME_IP
```

### 13.2 Configure Fail2Ban (SSH Brute Force Protection)

```bash
sudo nano /etc/fail2ban/jail.local
```

Paste:

```ini
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 3
backend  = systemd

[sshd]
enabled  = true
port     = ssh
filter   = sshd
logpath  = %(sshd_log)s
maxretry = 3
bantime  = 86400
```

```bash
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
sudo fail2ban-client status sshd
```

### 13.3 Disable SSH Password Authentication

```bash
sudo nano /etc/ssh/sshd_config
```

Ensure these settings:

```text
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
ChallengeResponseAuthentication no
UsePAM yes
```

```bash
sudo systemctl restart sshd
```

### 13.4 Enable Automatic Security Updates

```bash
sudo dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### 13.5 Disable Swap (Prevent Sensitive Data on Disk)

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

### 13.6 Harden Tor Configuration

Add these lines to `/etc/tor/torrc` for additional security:

```text
# Disable Tor's DNS port (not needed for hidden services)
DNSPort 0

# Disable control port unless needed
ControlPort 0

# Do not allow Tor to act as an exit node
ExitPolicy reject *:*

# Limit Tor's bandwidth (optional, prevents resource exhaustion)
MaxClientCircuitPending 32
```

```bash
sudo systemctl restart tor
```

---

## 14. Step 11: Testing the Hidden Service

### 14.1 Test Locally on the Server

```bash
# Test Nginx is serving on localhost
curl -s http://127.0.0.1:80 | head -20

# Test Express backend
curl -s http://127.0.0.1:5000/api/health

# Test MongoDB connection
mongosh --eval "db.adminCommand('ping')" -u mernAdmin -p YOUR_PASSWORD --authenticationDatabase admin
```

### 14.2 Test via Tor Browser

1. Download and install **Tor Browser** from [torproject.org](https://www.torproject.org/)
2. Open Tor Browser
3. Paste your `.onion` address in the URL bar
4. Your MERN app should load

### 14.3 Test via Command Line (curl through Tor)

```bash
# On the server itself
curl --socks5-hostname 127.0.0.1:9050 http://YOUR_ONION_ADDRESS.onion
```

### 14.4 Verify Anonymity

```bash
# From your local machine, try to access the EC2 public IP directly
curl http://YOUR_EC2_PUBLIC_IP

# This should FAIL / timeout / refuse connection
# because Nginx is bound to 127.0.0.1 only
```

---

## 15. Step 12: Backup & Maintenance

### 15.1 Backup the Tor Private Key (CRITICAL)

If you lose the `hs_ed25519_secret_key`, your `.onion` address is **gone forever**. There is no recovery.

```bash
# Create a secure backup
sudo tar -czf /tmp/tor-keys-backup.tar.gz /var/lib/tor/mern_hidden_service/

# Copy to a secure location (USB drive, encrypted storage)
scp -i /path/to/key.pem ubuntu@YOUR_EC2_IP:/tmp/tor-keys-backup.tar.gz ./local-backup/

# Remove from server
sudo rm /tmp/tor-keys-backup.tar.gz
```

### 15.2 Backup the MERN Application

```bash
# Backup MongoDB
mongodump --uri="mongodb://mernAdmin:PASSWORD@127.0.0.1:27017" --out=/tmp/mongo-backup

# Backup application code
tar -czf /tmp/mern-app-backup.tar.gz /var/www/mern-app/
```

### 15.3 Monitor Services

```bash
# Check all services
sudo systemctl status tor
sudo systemctl status nginx
sudo systemctl status mongod
pm2 status

# View Tor logs
sudo journalctl -u tor -f --no-pager | tail -50

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# View PM2 logs
pm2 logs mern-backend
```

### 15.4 Update the Application

```bash
cd /var/www/mern-app
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart mern-backend

# Update frontend
cd ../frontend
npm install
npm run build
sudo chown -R www-data:www-data /var/www/mern-app/frontend/build
```

### 15.5 Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart tor nginx mongod
pm2 restart all
```

---

## 16. Troubleshooting

### Problem: `.onion` site is not loading

```bash
# 1. Check if Tor is running
sudo systemctl status tor

# 2. Check Tor logs for errors
sudo journalctl -u tor --no-pager | tail -30

# 3. Verify the hidden service directory permissions
sudo ls -la /var/lib/tor/mern_hidden_service/
sudo chown -R debian-tor:debian-tor /var/lib/tor/mern_hidden_service/
sudo chmod 700 /var/lib/tor/mern_hidden_service/

# 4. Verify Nginx is running on localhost
sudo ss -tlnp | grep :80
curl http://127.0.0.1:80

# 5. Restart everything
sudo systemctl restart tor
sudo systemctl restart nginx
pm2 restart all
```

### Problem: Nginx returns 502 Bad Gateway

```bash
# Express backend is not running
pm2 status
pm2 restart mern-backend
pm2 logs mern-backend --lines 50

# Check if port 5000 is listening
sudo ss -tlnp | grep :5000
```

### Problem: Tor is not generating the hostname file

```bash
# Check torrc syntax
sudo tor --verify-config

# Check directory permissions
sudo ls -la /var/lib/tor/
sudo mkdir -p /var/lib/tor/mern_hidden_service/
sudo chown -R debian-tor:debian-tor /var/lib/tor/mern_hidden_service/
sudo chmod 700 /var/lib/tor/mern_hidden_service/

# Restart Tor
sudo systemctl restart tor

# Wait 30 seconds, then check
sudo cat /var/lib/tor/mern_hidden_service/hostname
```

### Problem: MongoDB connection refused

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check if auth is configured correctly
sudo mongosh --eval "db.adminCommand('ping')"

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Problem: PM2 process keeps restarting

```bash
# Check logs
pm2 logs mern-backend --lines 100

# Common causes:
# - Missing .env file
# - Wrong MongoDB URI
# - Port already in use
pm2 delete mern-backend
pm2 start server.js --name "mern-backend"
```

---

## 17. Common Mistakes & How to Avoid Them

| # | Mistake | Consequence | Fix |
|---|---|---|---|
| 1 | Nginx listens on `0.0.0.0:80` | Site exposed on public IP | Change to `127.0.0.1:80` |
| 2 | AWS Security Group opens port 80 | Site accessible without Tor | Remove port 80 from Security Group |
| 3 | React uses hardcoded `localhost:5000` API URLs | API calls fail over `.onion` | Use relative paths (`/api/...`) |
| 4 | `private_key` permissions are wrong | Tor cannot read the key | `chown debian-tor`, `chmod 700` |
| 5 | No backup of `hs_ed25519_secret_key` | Lose `.onion` address forever | Backup immediately after creation |
| 6 | MongoDB bound to `0.0.0.0` | Database exposed publicly | Set `bindIp: 127.0.0.1` |
| 7 | Express listens on `0.0.0.0:5000` | Backend exposed publicly | Bind to `127.0.0.1:5000` |
| 8 | Using AWS for illegal content | AWS terminates account, cooperates with law enforcement | Understand AWS Acceptable Use Policy |
| 9 | Not using PM2 | Backend crashes and stays down | Always use PM2 in production |
| 10 | Forgetting `pm2 startup` | Backend doesn't start after reboot | Run `pm2 startup` and `pm2 save` |

---

## 18. Full Command Reference

### Quick Setup (All Commands in Order)

```bash
# ═══════════════════════════════════════════════════════════
# PHASE 1: SYSTEM SETUP
# ═══════════════════════════════════════════════════════════

# SSH into server
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Set timezone
sudo timedatectl set-timezone UTC

# Install dependencies
sudo apt install -y curl wget git build-essential nginx tor ufw fail2ban unattended-upgrades software-properties-common gnupg

# ═══════════════════════════════════════════════════════════
# PHASE 2: NODE.JS & PM2
# ═══════════════════════════════════════════════════════════

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# ═══════════════════════════════════════════════════════════
# PHASE 3: MONGODB
# ═══════════════════════════════════════════════════════════

curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# ═══════════════════════════════════════════════════════════
# PHASE 4: DEPLOY MERN APP
# ═══════════════════════════════════════════════════════════

sudo mkdir -p /var/www/mern-app
sudo chown -R ubuntu:ubuntu /var/www/mern-app
cd /var/www/mern-app
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git .

# Backend
cd backend
npm install --production
nano .env   # Configure your environment variables
pm2 start server.js --name "mern-backend"
pm2 startup
pm2 save

# Frontend
cd ../frontend
npm install
npm run build
sudo chown -R www-data:www-data /var/www/mern-app/frontend/build

# ═══════════════════════════════════════════════════════════
# PHASE 5: NGINX CONFIGURATION
# ═══════════════════════════════════════════════════════════

sudo rm -f /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/mern-tor
# (Paste the Nginx config from Section 10.2)

sudo ln -s /etc/nginx/sites-available/mern-tor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Verify localhost binding
sudo ss -tlnp | grep :80

# ═══════════════════════════════════════════════════════════
# PHASE 6: TOR CONFIGURATION
# ═══════════════════════════════════════════════════════════

sudo nano /etc/tor/torrc
# (Paste the Tor config from Section 11.2)

sudo mkdir -p /var/lib/tor/mern_hidden_service/
sudo chown -R debian-tor:debian-tor /var/lib/tor/mern_hidden_service/
sudo chmod 700 /var/lib/tor/mern_hidden_service/

sudo tor --verify-config
sudo systemctl restart tor
sudo systemctl enable tor

# Wait 30 seconds, then get your .onion address
sudo cat /var/lib/tor/mern_hidden_service/hostname

# ═══════════════════════════════════════════════════════════
# PHASE 7: SECURITY HARDENING
# ═══════════════════════════════════════════════════════════

# UFW Firewall
sudo ufw --force reset
sudo ufw allow from YOUR_HOME_IP/32 to any port 22 proto tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable

# Fail2Ban
sudo nano /etc/fail2ban/jail.local
# (Paste config from Section 13.2)
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# SSH Hardening
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no, PermitRootLogin no
sudo systemctl restart sshd

# Automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades

# ═══════════════════════════════════════════════════════════
# PHASE 8: BACKUP
# ═══════════════════════════════════════════════════════════

sudo tar -czf /tmp/tor-keys-backup.tar.gz /var/lib/tor/mern_hidden_service/
# Transfer backup securely off-server, then:
sudo rm /tmp/tor-keys-backup.tar.gz

# ═══════════════════════════════════════════════════════════
# PHASE 9: VERIFICATION
# ═══════════════════════════════════════════════════════════

# Test Nginx locally
curl http://127.0.0.1:80

# Test Express backend
curl http://127.0.0.1:5000/api/health

# Check all services
sudo systemctl status tor nginx mongod
pm2 status

# Verify no public exposure
sudo ss -tlnp
```

---

## Appendix: File Locations Reference

| File/Directory | Purpose |
|---|---|
| `/etc/tor/torrc` | Tor daemon configuration |
| `/var/lib/tor/mern_hidden_service/` | Hidden service keys & hostname |
| `/var/lib/tor/mern_hidden_service/hostname` | Your `.onion` address |
| `/var/lib/tor/mern_hidden_service/hs_ed25519_secret_key` | **PRIVATE KEY (BACK THIS UP)** |
| `/etc/nginx/sites-available/mern-tor` | Nginx site configuration |
| `/var/www/mern-app/` | MERN application root |
| `/var/www/mern-app/frontend/build/` | React production build |
| `/var/www/mern-app/backend/.env` | Backend environment variables |
| `/var/log/tor/` | Tor logs |
| `/var/log/nginx/` | Nginx logs |
| `/var/log/mongodb/` | MongoDB logs |

---

> **Final Note:** A Tor hidden service provides strong network-level anonymity, but it does **not** protect against operational mistakes. Always bind services to `127.0.0.1`, lock down firewalls, back up your private key, and never mix personal identities with the server. The most common cause of de-anonymization is not a Tor vulnerability — it is a misconfigured server or a human error.