# AWS EC2 Instance Setup

> Last Updated: February 22, 2026

## Table of Contents
- [Launch an EC2 Instance](#launch-an-ec2-instance)
- [Connect to EC2](#connect-to-ec2)
- [Initial Server Setup](#initial-server-setup)
- [Security Group Configuration](#security-group-configuration)
- [Elastic IP](#elastic-ip)
- [EC2 Instance Management](#ec2-instance-management)
- [Useful Commands](#useful-commands)

---

## Launch an EC2 Instance

### Step-by-step (AWS Console)

1. Go to EC2 Dashboard > Launch Instance
2. Choose an AMI (Amazon Machine Image)
   - Recommended: Ubuntu Server 22.04 LTS (Free Tier eligible)
3. Choose Instance Type
   - Free Tier: `t2.micro` (1 vCPU, 1 GB RAM)
   - Small projects: `t3.small` (2 vCPU, 2 GB RAM)
4. Configure Key Pair
   - Create new key pair or select existing
   - Download `.pem` file (keep it safe)
5. Configure Network Settings
   - Allow SSH (port 22)
   - Allow HTTP (port 80)
   - Allow HTTPS (port 443)
6. Configure Storage
   - Default: 8 GB gp3
   - Recommended: 20-30 GB for typical projects
7. Launch Instance

---

## Connect to EC2

### From Linux/Mac

```bash
# Set permissions on key file (first time only)
chmod 400 your-key.pem

# Connect via SSH
Syntax:- ssh -i <key-file> ubuntu@<public-ip>
Example:- ssh -i my-key.pem ubuntu@54.123.45.67
```

### From Windows (PowerShell)

```powershell
# Connect via SSH
ssh -i "C:\path\to\your-key.pem" ubuntu@54.123.45.67
```

### Using SSH Config (recommended)

Add to `~/.ssh/config`:
```
Host my-server
    HostName 54.123.45.67
    User ubuntu
    IdentityFile ~/.ssh/your-key.pem
    Port 22
```

Then connect with:
```bash
ssh my-server
```

---

## Initial Server Setup

Run these commands after first connecting to a new EC2 instance:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Set timezone
sudo timedatectl set-timezone Asia/Kolkata

# Set hostname
sudo hostnamectl set-hostname my-server

# Install essential packages
sudo apt install -y curl wget git unzip htop net-tools

# Enable firewall
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw allow 80
sudo ufw allow 443

# Create a non-root user (optional but recommended)
sudo adduser deploy
sudo usermod -aG sudo deploy
```

---

## Security Group Configuration

A security group acts as a virtual firewall for your EC2 instance.

### Common Rules

| Type | Protocol | Port Range | Source | Purpose |
|------|----------|-----------|--------|---------|
| SSH | TCP | 22 | Your IP / 0.0.0.0/0 | Remote access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web traffic |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 | Node.js app (dev) |
| Custom TCP | TCP | 5432 | Your IP | PostgreSQL |
| Custom TCP | TCP | 27017 | Your IP | MongoDB |
| Custom TCP | TCP | 3306 | Your IP | MySQL |

Note: Restrict database ports to your IP only. Never open them to 0.0.0.0/0.

---

## Elastic IP

An Elastic IP gives your instance a static public IP that remains the same after stop/start.

```
AWS Console > EC2 > Elastic IPs > Allocate Elastic IP address > Associate
```

### AWS CLI

```bash
# Allocate Elastic IP
aws ec2 allocate-address --domain vpc

# Associate with instance
Syntax:- aws ec2 associate-address --instance-id <instance-id> --allocation-id <alloc-id>
Example:- aws ec2 associate-address --instance-id i-0abcd1234 --allocation-id eipalloc-0xyz5678

# Release Elastic IP
aws ec2 release-address --allocation-id eipalloc-0xyz5678
```

Note: You are charged for Elastic IPs that are NOT associated with a running instance.

---

## EC2 Instance Management

### AWS CLI

```bash
# List all instances
aws ec2 describe-instances --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,IP:PublicIpAddress,Type:InstanceType}" --output table

# Start instance
aws ec2 start-instances --instance-ids i-0abcd1234

# Stop instance
aws ec2 stop-instances --instance-ids i-0abcd1234

# Reboot instance
aws ec2 reboot-instances --instance-ids i-0abcd1234

# Terminate instance (permanently delete)
aws ec2 terminate-instances --instance-ids i-0abcd1234
```

### Create AMI (Backup)

```bash
Syntax:- aws ec2 create-image --instance-id <id> --name "backup-name" --no-reboot
Example:- aws ec2 create-image --instance-id i-0abcd1234 --name "my-server-backup-2026" --no-reboot
```

---

## Useful Commands

```bash
# Check instance metadata from within EC2
curl http://169.254.169.254/latest/meta-data/

# Get public IP
curl http://169.254.169.254/latest/meta-data/public-ipv4

# Get instance ID
curl http://169.254.169.254/latest/meta-data/instance-id

# Get instance type
curl http://169.254.169.254/latest/meta-data/instance-type

# Check available disk space
df -h

# Check memory usage
free -m

# Check running processes
htop
```
