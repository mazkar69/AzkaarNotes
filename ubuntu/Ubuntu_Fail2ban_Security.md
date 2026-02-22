# Fail2ban - Brute Force Protection for Linux Servers

## Table of Contents
1. [What is Fail2ban?](#what-is-fail2ban)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [SSH Protection](#ssh-protection)
5. [Nginx Protection](#nginx-protection)
6. [Apache Protection](#apache-protection)
7. [Common Commands](#common-commands)
8. [Custom Jail Configuration](#custom-jail-configuration)
9. [Whitelist IP Addresses](#whitelist-ip-addresses)
10. [Email Notifications](#email-notifications)

---

## What is Fail2ban?

Fail2ban is an **intrusion prevention software** that protects servers from brute-force attacks. It monitors log files for malicious activity and automatically bans IP addresses that show suspicious behavior.

### How It Works
```
┌─────────────────────────────────────────────────────────┐
│                    Fail2ban Workflow                    │
├─────────────────────────────────────────────────────────┤
│  1. Monitor log files (SSH, Nginx, Apache, etc.)        │
│  2. Detect failed login attempts / suspicious patterns  │
│  3. Match against defined filters (regex patterns)      │
│  4. After X failures → Ban IP using iptables/firewall   │
│  5. Unban after specified time                          │
└─────────────────────────────────────────────────────────┘
```

### Key Terms
| Term | Description |
|------|-------------|
| **Jail** | A combination of filter + action for a specific service |
| **Filter** | Regex patterns to match malicious log entries |
| **Action** | What to do when pattern matches (ban, email, etc.) |
| **Ban Time** | Duration an IP stays banned |
| **Find Time** | Time window to count failures |
| **Max Retry** | Number of failures before ban |

---

## Installation

### Install Fail2ban
```sh
sudo apt update
sudo apt install fail2ban -y
```

### Verify Installation
```sh
fail2ban-client --version
```

### Check Service Status
```sh
sudo systemctl status fail2ban
```

### Start/Enable Fail2ban
```sh
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## Configuration

### Configuration Files Location
```sh
/etc/fail2ban/
├── fail2ban.conf      # Main config (don't edit directly)
├── jail.conf          # Default jail config (don't edit directly)
├── jail.local         # Your custom config (create this)
├── jail.d/            # Additional jail configs
├── filter.d/          # Filter definitions
└── action.d/          # Action definitions
```

### Create Local Configuration
Always create `jail.local` instead of editing `jail.conf`:
```sh
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
```

Or create a minimal custom config:
```sh
sudo nano /etc/fail2ban/jail.local
```

### Basic jail.local Configuration
```ini
[DEFAULT]
# Ban duration (10 minutes)
bantime = 10m

# Time window to count failures
findtime = 10m

# Number of failures before ban
maxretry = 5

# Ignore/whitelist these IPs
ignoreip = 127.0.0.1/8 ::1

# Email for notifications (optional)
destemail = your@email.com
sender = fail2ban@yourserver.com

# Action to take (ban only, or ban + email)
action = %(action_)s

# Backend for log monitoring
backend = systemd
```

### Restart After Configuration Changes
```sh
sudo systemctl restart fail2ban
```

---

## SSH Protection

### Enable SSH Jail
Add to `/etc/fail2ban/jail.local`:
```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 10m
bantime = 1h
```

### For Custom SSH Port
```ini
[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1h
```

### Aggressive SSH Protection
```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 5m
bantime = 24h

[sshd-aggressive]
enabled = true
port = ssh
filter = sshd[mode=aggressive]
logpath = /var/log/auth.log
maxretry = 1
findtime = 1d
bantime = 7d
```

---

## Nginx Protection

### Nginx Authentication Failures
```ini
[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1h
```

### Nginx Bad Bots
Create filter file first:
```sh
sudo nano /etc/fail2ban/filter.d/nginx-badbots.conf
```

```ini
[Definition]
failregex = ^<HOST> -.*"(GET|POST|HEAD).*HTTP.*" (404|444|403|400) .*$
ignoreregex =
```

Add jail:
```ini
[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 5
findtime = 1m
bantime = 1d
```

### Nginx Rate Limit (429 errors)
Create filter:
```sh
sudo nano /etc/fail2ban/filter.d/nginx-limit-req.conf
```

```ini
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
```

Add jail:
```ini
[nginx-limit-req]
enabled = true
port = http,https
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 1m
bantime = 1h
```

---

## Apache Protection

### Apache Authentication Failures
```ini
[apache-auth]
enabled = true
port = http,https
filter = apache-auth
logpath = /var/log/apache2/error.log
maxretry = 3
bantime = 1h
```

### Apache Bad Bots
```ini
[apache-badbots]
enabled = true
port = http,https
filter = apache-badbots
logpath = /var/log/apache2/access.log
maxretry = 5
bantime = 1d
```

### Apache Overflows (Buffer overflow attempts)
```ini
[apache-overflows]
enabled = true
port = http,https
filter = apache-overflows
logpath = /var/log/apache2/error.log
maxretry = 2
bantime = 1d
```

---

## Common Commands

### Check Fail2ban Status
```sh
sudo fail2ban-client status
```

### Check Specific Jail Status
```sh
Syntax:- sudo fail2ban-client status <jail-name>
Example:- sudo fail2ban-client status sshd
```

### View Banned IPs for a Jail
```sh
sudo fail2ban-client status sshd
```

### Manually Ban an IP
```sh
Syntax:- sudo fail2ban-client set <jail-name> banip <IP>
Example:- sudo fail2ban-client set sshd banip 192.168.1.100
```

### Manually Unban an IP
```sh
Syntax:- sudo fail2ban-client set <jail-name> unbanip <IP>
Example:- sudo fail2ban-client set sshd unbanip 192.168.1.100
```

### Unban IP from All Jails
```sh
Syntax:- sudo fail2ban-client unban <IP>
Example:- sudo fail2ban-client unban 192.168.1.100
```

### Unban All IPs
```sh
sudo fail2ban-client unban --all
```

### Reload Configuration
```sh
sudo fail2ban-client reload
```

### Reload Specific Jail
```sh
Syntax:- sudo fail2ban-client reload <jail-name>
Example:- sudo fail2ban-client reload sshd
```

### Test Filter Regex Against Log File
```sh
Syntax:- sudo fail2ban-regex <log-file> <filter-file>
Example:- sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf
```

### View Fail2ban Logs
```sh
sudo tail -f /var/log/fail2ban.log
```

---

## Custom Jail Configuration

### Example: Protect Custom Application
Create filter `/etc/fail2ban/filter.d/myapp.conf`:
```ini
[Definition]
failregex = ^.*Failed login attempt from <HOST>.*$
            ^.*Invalid password from <HOST>.*$
ignoreregex =
```

Add jail to `jail.local`:
```ini
[myapp]
enabled = true
port = 3000
filter = myapp
logpath = /var/log/myapp/error.log
maxretry = 5
findtime = 10m
bantime = 1h
```

### Permanent Ban (Recidive Jail)
Ban repeat offenders for longer periods:
```ini
[recidive]
enabled = true
filter = recidive
logpath = /var/log/fail2ban.log
action = %(action_)s
bantime = 1w
findtime = 1d
maxretry = 3
```

---

## Whitelist IP Addresses

### Global Whitelist in jail.local
```ini
[DEFAULT]
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24 YOUR_HOME_IP
```

### Whitelist for Specific Jail
```ini
[sshd]
enabled = true
ignoreip = 127.0.0.1/8 192.168.1.100 10.0.0.0/8
```

### Add IP to Whitelist Without Restart
```sh
Syntax:- sudo fail2ban-client set <jail-name> addignoreip <IP>
Example:- sudo fail2ban-client set sshd addignoreip 192.168.1.100
```

---

## Email Notifications

### Install Mail Utilities
```sh
sudo apt install sendmail -y
```

### Configure Email Notifications
```ini
[DEFAULT]
destemail = admin@example.com
sender = fail2ban@yourserver.com
sendername = Fail2ban

# Action with email notification on ban
action = %(action_mwl)s
```

### Action Types
| Action | Description |
|--------|-------------|
| `%(action_)s` | Ban only (default) |
| `%(action_mw)s` | Ban + email with whois info |
| `%(action_mwl)s` | Ban + email with whois + log lines |

---

## Quick Setup - Production Ready

### Complete jail.local for Web Server
```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 24h

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 1h

[nginx-badbots]
enabled = true
port = http,https
filter = apache-badbots
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 1d

[recidive]
enabled = true
filter = recidive
logpath = /var/log/fail2ban.log
bantime = 1w
findtime = 1d
maxretry = 3
```

### Apply Configuration
```sh
sudo systemctl restart fail2ban
sudo fail2ban-client status
```

---

## Useful Integration with UFW

Fail2ban works alongside UFW firewall. When fail2ban bans an IP, it adds iptables rules that work with UFW.

Check banned IPs in iptables:
```sh
sudo iptables -L -n | grep -i fail2ban
```

---

## Troubleshooting

### Check if Fail2ban is Running
```sh
sudo systemctl status fail2ban
```

### View Errors
```sh
sudo journalctl -u fail2ban
```

### Test Configuration
```sh
sudo fail2ban-client -t
```

### Common Issues
| Issue | Solution |
|-------|----------|
| Jail not starting | Check log path exists and is readable |
| Filter not matching | Test with `fail2ban-regex` command |
| Bans not working | Check iptables permissions, UFW status |
| Too many false positives | Increase maxretry or add to ignoreip |
