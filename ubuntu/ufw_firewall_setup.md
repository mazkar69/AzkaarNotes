# UFW Firewall Setup - Complete Guide for Ubuntu

## Table of Contents
- [Installation & Basic Setup](#installation--basic-setup)
- [Allow Rules](#allow-rules)
- [Deny Rules](#deny-rules)
- [IP-Based Rules](#ip-based-rules)
- [Managing Rules](#managing-rules)
- [Status & Monitoring](#status--monitoring)
- [Application Profiles](#application-profiles)
- [Advanced Features](#advanced-features)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)
- [Quick Reference](#quick-reference)

---

## Installation & Basic Setup

```bash
# Install UFW
sudo apt update
sudo apt install ufw

# Set default policies (recommended)
sudo ufw default deny incoming
sudo ufw default allow outgoing

# IMPORTANT: Allow SSH before enabling
sudo ufw allow ssh

# Enable UFW
sudo ufw enable

# Disable/Reset UFW
sudo ufw disable
sudo ufw reset
sudo ufw reload
```

**⚠️ WARNING**: Always allow SSH before enabling UFW to avoid losing connection!

---

## Allow Rules

### Basic Port Rules

```bash
# Allow by port number
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow 3000/tcp      # Custom app
sudo ufw allow 53/udp        # DNS

# Allow port range
sudo ufw allow 3000:3010/tcp

# Allow both TCP and UDP (omit protocol)
sudo ufw allow 3000
```

### Allow by Service Name

```bash
# Common services (from /etc/services)
sudo ufw allow ssh           # Port 22
sudo ufw allow http          # Port 80
sudo ufw allow https         # Port 443
sudo ufw allow www           # Port 80
sudo ufw allow ftp           # Port 21
sudo ufw allow smtp          # Port 25
sudo ufw allow mysql         # Port 3306
sudo ufw allow postgresql    # Port 5432
```

---

## Deny Rules

```bash
# Deny specific port
sudo ufw deny 3306/tcp
sudo ufw deny http

# Deny port range
sudo ufw deny 8000:9000/tcp
```

---

## IP-Based Rules

### Allow from IP

```bash
# Allow all traffic from specific IP
sudo ufw allow from 192.168.1.100

# Allow IP to specific port
sudo ufw allow from 192.168.1.100 to any port 22
sudo ufw allow from 203.0.113.5 to any port 3000 proto tcp

# Allow from subnet
sudo ufw allow from 192.168.1.0/24
sudo ufw allow from 10.0.0.0/8

# Real-world examples
sudo ufw allow from 203.0.113.0/24 to any port 22  # Office SSH access
sudo ufw allow from 10.0.1.50 to any port 27017    # App server to MongoDB
```

### Block IP

```bash
# Block all traffic from IP
sudo ufw deny from 192.168.1.100

# Block IP on specific port
sudo ufw deny from 203.0.113.5 to any port 22

# Block subnet
sudo ufw deny from 192.168.1.0/24

# Real-world examples
sudo ufw deny from 123.45.67.89                    # Block malicious IP
sudo ufw deny from 123.45.67.89 to any port 80     # Block spam bot
```

---

## Managing Rules

### Delete Rules

```bash
# Show numbered rules
sudo ufw status numbered

# Delete by number
sudo ufw delete 3

# Delete by specification
sudo ufw delete allow 80/tcp
sudo ufw delete deny from 192.168.1.100
```

---

## Status & Monitoring

### Check Status

```bash
# Basic status
sudo ufw status

# Verbose (shows policies and logging)
sudo ufw status verbose

# Numbered (for deletion)
sudo ufw status numbered
```

### List Active Ports

```bash
# Using ss (modern)
sudo ss -tulpn | grep LISTEN

# Using netstat
sudo netstat -tulpn | grep LISTEN

# Check specific port
sudo ss -tulpn | grep :3000
```

### Logging

```bash
# Enable/disable logging
sudo ufw logging on
sudo ufw logging off

# Set log level
sudo ufw logging low        # Default
sudo ufw logging medium
sudo ufw logging high

# View logs
sudo tail -f /var/log/ufw.log
sudo grep UFW /var/log/syslog
```

---

## Application Profiles

```bash
# List available profiles
sudo ufw app list

# Show profile details
sudo ufw app info 'Nginx Full'

# Allow using profiles
sudo ufw allow 'Nginx Full'      # HTTP + HTTPS
sudo ufw allow 'Nginx HTTP'      # HTTP only
sudo ufw allow 'Nginx HTTPS'     # HTTPS only
sudo ufw allow 'Apache Full'     # Apache HTTP + HTTPS
sudo ufw allow 'OpenSSH'         # SSH
```

---

## Advanced Features

### Rate Limiting (Anti-Brute Force)

```bash
# Limit SSH connections (6 attempts in 30 seconds)
sudo ufw limit ssh
sudo ufw limit 22/tcp
sudo ufw limit 3000/tcp
```

### Interface-Specific Rules

```bash
# Allow on specific network interface
sudo ufw allow in on eth0 to any port 80
sudo ufw deny in on eth1 to any port 22
```

### Reject vs Deny

```bash
# Deny (silent - recommended)
sudo ufw deny from 192.168.1.100

# Reject (sends response - less secure)
sudo ufw reject from 192.168.1.100
```

---

## Security Best Practices

### Essential Setup

```bash
# Web server setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Database server (restricted)
sudo ufw allow ssh
sudo ufw allow from 10.0.1.0/24 to any port 27017  # Only from app subnet
sudo ufw enable

# Development server
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

### ✅ Best Practices

- Always allow SSH before enabling UFW
- Use `default deny incoming` policy
- Only open necessary ports
- Use rate limiting for SSH: `sudo ufw limit ssh`
- Block malicious IPs immediately
- Use application profiles when available
- Enable logging for monitoring
- Don't expose databases publicly

### ❌ Avoid

- Never enable UFW without allowing SSH first
- Don't use `default allow incoming`
- Don't expose databases (MySQL, MongoDB, PostgreSQL) publicly
- Don't open unnecessary port ranges

### Emergency Recovery

If locked out via SSH:

1. Access via console (AWS EC2, VPS dashboard)
2. Run: `sudo ufw disable`
3. Fix rules: `sudo ufw allow ssh`
4. Re-enable: `sudo ufw enable`

---

## Troubleshooting

### Common Issues

**Can't connect after enabling UFW:**
```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

**Rule not working:**
```bash
# Check rule order (first match wins)
sudo ufw status numbered
# Delete conflicting rule
sudo ufw delete [number]
```

**Check if UFW is blocking:**
```bash
sudo ufw status verbose
sudo tail -f /var/log/ufw.log
telnet localhost 80
```

**Reset everything:**
```bash
sudo ufw reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw enable
```

---

## Quick Reference

### Command Cheatsheet

| Task | Command |
|------|---------|
| Install | `sudo apt install ufw` |
| Enable/Disable | `sudo ufw enable` / `sudo ufw disable` |
| Allow port | `sudo ufw allow 80/tcp` |
| Allow service | `sudo ufw allow ssh` |
| Deny port | `sudo ufw deny 3306/tcp` |
| Block IP | `sudo ufw deny from 192.168.1.100` |
| Allow from IP | `sudo ufw allow from 203.0.113.5` |
| IP to port | `sudo ufw allow from 10.0.1.5 to any port 22` |
| Port range | `sudo ufw allow 3000:3010/tcp` |
| Delete rule | `sudo ufw delete 3` |
| Status | `sudo ufw status verbose` |
| List ports | `sudo ss -tulpn \| grep LISTEN` |
| Rate limit | `sudo ufw limit ssh` |
| App profile | `sudo ufw allow 'Nginx Full'` |
| Reset | `sudo ufw reset` |
| Logging | `sudo ufw logging on` |

### Complete Setup Example

```bash
# 1. Install and configure
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 2. Allow necessary services
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp

# 3. Block unwanted IPs
sudo ufw deny from 192.168.1.100

# 4. Enable and verify
sudo ufw enable
sudo ufw status verbose
sudo ss -tulpn | grep LISTEN
```

**Remember**: Always allow SSH before enabling UFW! 🔒
