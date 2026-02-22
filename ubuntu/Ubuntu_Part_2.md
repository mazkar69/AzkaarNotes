# Ubuntu Server Administration - Part 2

Advanced topics covering RAID configuration, Cron jobs, Process Management, and useful administration tools.

---

## Table of Contents

1. [What is RAID?](#what-is-raid)
2. [RAID Levels Explained](#raid-levels-explained)
3. [Setting Up Software RAID with mdadm](#setting-up-software-raid-with-mdadm)
4. [Cron Jobs - Task Scheduling](#cron-jobs---task-scheduling)
5. [Process Management](#process-management)
6. [Webmin - GUI Administration](#webmin---gui-administration)
7. [FileZilla - FTP/SFTP File Transfer](#filezilla---ftpsftp-file-transfer)
8. [Useful Links and Resources](#useful-links-and-resources)

---

## What is RAID?

**RAID** stands for **Redundant Array of Independent Disks** (originally "Redundant Array of Inexpensive Disks").

RAID is a data storage virtualization technology that combines multiple physical disk drives into one or more logical units for:

- **Data Redundancy** (protection against disk failure)
- **Performance Improvement** (faster read/write speeds)
- **Or both**

### Types of RAID Implementation

| Type | Description | Pros | Cons |
|------|-------------|------|------|
| **Hardware RAID** | Dedicated RAID controller card manages the array | Better performance, OS independent, battery backup | Expensive, controller-specific |
| **Software RAID** | Operating system manages the array | Cheaper, flexible, no special hardware | Uses CPU resources, slightly slower |

> 💡 **Ubuntu uses `mdadm`** for software RAID management.

---

## RAID Levels Explained

### RAID 0 - Striped Volume

```
┌─────────────────────────────────────────────────────────────┐
│                        RAID 0                                │
│                    (Striping / No Redundancy)                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Data: A B C D E F G H                                     │
│                                                              │
│    ┌─────────┐    ┌─────────┐                               │
│    │  Disk 1 │    │  Disk 2 │                               │
│    ├─────────┤    ├─────────┤                               │
│    │    A    │    │    B    │                               │
│    │    C    │    │    D    │                               │
│    │    E    │    │    F    │                               │
│    │    G    │    │    H    │                               │
│    └─────────┘    └─────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**How it works:** Data is split (striped) across multiple disks. Each disk holds a portion of the data.

| Aspect | Details |
|--------|---------|
| **Minimum Disks** | 2 |
| **Usable Capacity** | 100% (Total of all disks) |
| **Fault Tolerance** | ❌ None - if one disk fails, ALL data is lost |
| **Read Speed** | ⬆️ Faster (parallel reads) |
| **Write Speed** | ⬆️ Faster (parallel writes) |
| **Use Case** | Video editing, gaming, temporary data where speed matters |

> ⚠️ **Warning**: RAID 0 provides NO data protection. Use only for non-critical data.

---

### RAID 1 - Mirrored Volume

```
┌─────────────────────────────────────────────────────────────┐
│                        RAID 1                                │
│                      (Mirroring)                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Data: A B C D                                             │
│                                                              │
│    ┌─────────┐    ┌─────────┐                               │
│    │  Disk 1 │    │  Disk 2 │                               │
│    ├─────────┤    ├─────────┤                               │
│    │    A    │ ←→ │    A    │  (Mirror)                     │
│    │    B    │ ←→ │    B    │  (Mirror)                     │
│    │    C    │ ←→ │    C    │  (Mirror)                     │
│    │    D    │ ←→ │    D    │  (Mirror)                     │
│    └─────────┘    └─────────┘                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**How it works:** Data is duplicated (mirrored) on two or more disks. Each disk contains an exact copy.

| Aspect | Details |
|--------|---------|
| **Minimum Disks** | 2 |
| **Usable Capacity** | 50% (Half of total capacity) |
| **Fault Tolerance** | ✅ Survives 1 disk failure |
| **Read Speed** | ⬆️ Faster (can read from either disk) |
| **Write Speed** | Same or slightly slower |
| **Use Case** | OS drives, critical databases, small servers |

---

### RAID 10 (1+0) - Striped and Mirrored

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            RAID 10 (1+0)                                 │
│                     (Stripe of Mirrors)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Data: A B C D E F G H                                                 │
│                                                                          │
│         Mirror Set 1              Mirror Set 2                           │
│    ┌─────────┬─────────┐    ┌─────────┬─────────┐                       │
│    │  Disk 1 │  Disk 2 │    │  Disk 3 │  Disk 4 │                       │
│    ├─────────┼─────────┤    ├─────────┼─────────┤                       │
│    │    A    │    A    │    │    B    │    B    │                       │
│    │    C    │    C    │    │    D    │    D    │                       │
│    │    E    │    E    │    │    F    │    F    │                       │
│    │    G    │    G    │    │    H    │    H    │                       │
│    └─────────┴─────────┘    └─────────┴─────────┘                       │
│         ↑                        ↑                                       │
│         └────── Striped ─────────┘                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**How it works:** Combines RAID 1 (mirroring) and RAID 0 (striping). Data is first mirrored, then striped across mirror sets.

| Aspect | Details |
|--------|---------|
| **Minimum Disks** | 4 |
| **Usable Capacity** | 50% (Half of total capacity) |
| **Fault Tolerance** | ✅ Survives multiple disk failures (1 per mirror set) |
| **Read Speed** | ⬆️⬆️ Very fast |
| **Write Speed** | ⬆️ Fast |
| **Use Case** | Database servers, high-performance applications, enterprise |

### RAID Comparison Table

| RAID Level | Min Disks | Capacity | Fault Tolerance | Speed | Best For |
|------------|-----------|----------|-----------------|-------|----------|
| RAID 0 | 2 | 100% | None | Fastest | Temporary/non-critical data |
| RAID 1 | 2 | 50% | 1 disk | Fast read | OS, small critical data |
| RAID 5 | 3 | (N-1)/N | 1 disk | Good | General purpose servers |
| RAID 6 | 4 | (N-2)/N | 2 disks | Good | Large storage, archives |
| RAID 10 | 4 | 50% | 1 per mirror | Very fast | Databases, enterprise |

---

## Setting Up Software RAID with mdadm

### Installing mdadm

```sh
# Update package index
sudo apt update

# Install mdadm
sudo apt install mdadm
```

### Creating RAID Arrays

#### Prerequisites

```sh
# Check available disks
sudo fdisk -l

# Or use lsblk for cleaner output
lsblk

# Example output:
# sda    - Main OS disk
# sdb    - First RAID disk
# sdc    - Second RAID disk
```

#### Creating RAID 0 (Striped)

```sh
# Create RAID 0 with 2 disks
Syntax:- sudo mdadm --create /dev/md0 --level=0 --raid-devices=2 <disk1> <disk2>
Example:- sudo mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc

# Verify creation
cat /proc/mdstat

# Format the RAID array
sudo mkfs.ext4 /dev/md0

# Create mount point and mount
sudo mkdir /mnt/raid0
sudo mount /dev/md0 /mnt/raid0
```

#### Creating RAID 1 (Mirrored)

```sh
# Create RAID 1 with 2 disks
Syntax:- sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 <disk1> <disk2>
Example:- sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc

# Watch sync progress
watch cat /proc/mdstat

# Format and mount
sudo mkfs.ext4 /dev/md0
sudo mkdir /mnt/raid1
sudo mount /dev/md0 /mnt/raid1
```

#### Creating RAID 10 (Striped + Mirrored)

```sh
# Create RAID 10 with 4 disks
Syntax:- sudo mdadm --create /dev/md0 --level=10 --raid-devices=4 <disk1> <disk2> <disk3> <disk4>
Example:- sudo mdadm --create /dev/md0 --level=10 --raid-devices=4 /dev/sdb /dev/sdc /dev/sdd /dev/sde

# Format and mount
sudo mkfs.ext4 /dev/md0
sudo mkdir /mnt/raid10
sudo mount /dev/md0 /mnt/raid10
```

### Managing RAID Arrays

```sh
# View RAID status
sudo mdadm --detail /dev/md0

# View all RAID arrays
cat /proc/mdstat

# Add spare disk to array
sudo mdadm --add /dev/md0 /dev/sdd

# Remove failed disk
sudo mdadm --remove /dev/md0 /dev/sdc

# Mark disk as failed (for testing)
sudo mdadm --fail /dev/md0 /dev/sdc

# Stop RAID array
sudo mdadm --stop /dev/md0

# Assemble existing array
sudo mdadm --assemble /dev/md0 /dev/sdb /dev/sdc
```

### Saving RAID Configuration

```sh
# Save configuration to mdadm.conf
sudo mdadm --detail --scan | sudo tee -a /etc/mdadm/mdadm.conf

# Update initramfs
sudo update-initramfs -u

# Add to /etc/fstab for persistent mounting
echo '/dev/md0 /mnt/raid ext4 defaults 0 0' | sudo tee -a /etc/fstab
```

---

## Cron Jobs - Task Scheduling

**Cron** is a time-based job scheduler in Linux. It allows you to run scripts or commands automatically at specified times.

### Understanding Crontab

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
│ │ │ │ │
* * * * * command_to_execute
```

### Cron Special Characters

| Character | Meaning | Example |
|-----------|---------|---------|
| `*` | Any value | `* * * * *` = every minute |
| `,` | List of values | `1,15,30` = at 1, 15, and 30 |
| `-` | Range of values | `1-5` = 1 through 5 |
| `/` | Step values | `*/5` = every 5 units |

### Managing Crontab

#### User Crontab (Without Root)

```sh
# Edit current user's crontab
crontab -e

# List current user's cron jobs
crontab -l

# Remove current user's crontab
crontab -r

# Edit crontab for specific user (requires sudo)
sudo crontab -u username -e
```

#### System-wide Crontab (With Root)

```sh
# Edit system crontab
sudo nano /etc/crontab

# System crontab format (includes user field):
# minute hour day month weekday user command
# 0 5 * * * root /path/to/script.sh
```

#### Cron Directories

```sh
# Scripts in these directories run automatically:
/etc/cron.hourly/    # Every hour
/etc/cron.daily/     # Every day
/etc/cron.weekly/    # Every week
/etc/cron.monthly/   # Every month

# Just drop an executable script (no extension needed)
sudo cp backup.sh /etc/cron.daily/backup
sudo chmod +x /etc/cron.daily/backup
```

### Crontab Examples

```sh
# Edit crontab
crontab -e

# ┌─────────────────────────────────────────────────────────────────┐
# │                    COMMON CRON EXAMPLES                         │
# └─────────────────────────────────────────────────────────────────┘

# Run every minute
* * * * * /path/to/script.sh

# Run every 5 minutes
*/5 * * * * /path/to/script.sh

# Run every hour at minute 0
0 * * * * /path/to/script.sh

# Run daily at 2:30 AM
30 2 * * * /path/to/script.sh

# Run every Monday at 5:00 AM
0 5 * * 1 /path/to/script.sh

# Run on 1st of every month at midnight
0 0 1 * * /path/to/script.sh

# Run every weekday (Mon-Fri) at 9:00 AM
0 9 * * 1-5 /path/to/script.sh

# Run every 15 minutes during business hours (9 AM - 5 PM)
*/15 9-17 * * * /path/to/script.sh

# Run at midnight on New Year's Day
0 0 1 1 * /path/to/script.sh

# Run twice a day at 6 AM and 6 PM
0 6,18 * * * /path/to/script.sh
```

### Cron with Output Logging

```sh
# Redirect output to a log file
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1

# Discard all output (silent)
0 2 * * * /path/to/backup.sh > /dev/null 2>&1

# Send output to email (if mail is configured)
MAILTO="admin@example.com"
0 2 * * * /path/to/backup.sh
```

### Cron Environment Variables

```sh
# Set at the top of crontab
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=admin@example.com
HOME=/home/username

# Then your cron jobs
0 2 * * * /path/to/script.sh
```

### Viewing Cron Logs

```sh
# View cron execution logs
sudo grep CRON /var/log/syslog

# Or on some systems
sudo cat /var/log/cron.log
```

### Cron vs User Crontab

| Aspect | User Crontab (`crontab -e`) | System Crontab (`/etc/crontab`) |
|--------|----------------------------|--------------------------------|
| Edit Command | `crontab -e` | `sudo nano /etc/crontab` |
| User Field | Not needed (runs as current user) | Required (specify which user) |
| Location | `/var/spool/cron/crontabs/` | `/etc/crontab` |
| Use Case | Personal scheduled tasks | System-wide scheduled tasks |

---

## Process Management

### Viewing Processes

#### ps - Process Status

```sh
# Show processes for current user
ps

# Show all processes (detailed)
ps aux

# Output columns explained:
# USER   - Process owner
# PID    - Process ID
# %CPU   - CPU usage percentage
# %MEM   - Memory usage percentage
# VSZ    - Virtual memory size
# RSS    - Resident Set Size (physical memory)
# TTY    - Terminal type
# STAT   - Process state
# START  - Start time
# TIME   - CPU time used
# COMMAND - Command name

# Show process tree
ps auxf

# Find specific process
ps aux | grep nginx

# Show processes by specific user
ps -u username
```

#### Process States (STAT column)

| State | Meaning |
|-------|---------|
| `R` | Running |
| `S` | Sleeping (waiting for event) |
| `D` | Uninterruptible sleep (usually I/O) |
| `Z` | Zombie (terminated but not reaped) |
| `T` | Stopped (by signal or debugger) |
| `+` | Foreground process |
| `<` | High priority |
| `N` | Low priority |

#### top - Real-time Process Viewer

```sh
# Start top
top

# Top shortcuts:
# q       - Quit
# k       - Kill a process (enter PID)
# r       - Renice (change priority)
# M       - Sort by memory usage
# P       - Sort by CPU usage
# c       - Show full command
# 1       - Show individual CPUs
# h       - Help

# Run top with specific refresh interval (2 seconds)
top -d 2

# Show processes for specific user
top -u username
```

#### htop - Interactive Process Viewer (Recommended)

```sh
# Install htop
sudo apt install htop

# Run htop
htop

# htop advantages over top:
# - Colorful, easier to read
# - Mouse support
# - Vertical and horizontal scrolling
# - Tree view of processes
# - Kill without entering PID
```

### Managing Foreground and Background Processes

#### Running Processes in Background

```sh
# Start process in background (add & at end)
./long_running_script.sh &

# Output shows job number and PID
# [1] 12345

# Run command and detach from terminal
nohup ./script.sh &

# View background jobs
jobs

# Output:
# [1]+  Running    ./script.sh &
# [2]-  Stopped    ./another_script.sh
```

#### fg - Bring to Foreground

```sh
# Bring most recent background job to foreground
fg

# Bring specific job to foreground
Syntax:- fg %<job_number>
Example:- fg %1

# Example workflow:
./long_script.sh    # Running in foreground
# Press Ctrl+Z to suspend
# [1]+  Stopped    ./long_script.sh

bg %1              # Resume in background
fg %1              # Bring back to foreground
```

#### bg - Resume in Background

```sh
# Resume suspended job in background
Syntax:- bg %<job_number>
Example:- bg %1
```

#### Ctrl+Z vs Ctrl+C

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | **Terminate** the process (sends SIGINT) |
| `Ctrl+Z` | **Suspend** the process (sends SIGTSTP) - can be resumed |

### Killing Processes

#### kill - Terminate by PID

```sh
# Find process ID
ps aux | grep process_name
# or
pgrep process_name

# Kill process gracefully (SIGTERM - default)
Syntax:- kill <PID>
Example:- kill 12345

# Kill process forcefully (SIGKILL)
Syntax:- kill -9 <PID>
Example:- kill -9 12345

# Kill by job number
kill %1
```

#### Common Kill Signals

| Signal | Number | Name | Description |
|--------|--------|------|-------------|
| SIGHUP | 1 | Hangup | Reload configuration |
| SIGINT | 2 | Interrupt | Same as Ctrl+C |
| SIGKILL | 9 | Kill | Force kill (cannot be caught) |
| SIGTERM | 15 | Terminate | Graceful shutdown (default) |
| SIGSTOP | 19 | Stop | Pause process (cannot be caught) |
| SIGCONT | 18 | Continue | Resume paused process |

```sh
# Send specific signal
kill -SIGHUP 12345    # Reload config
kill -SIGTERM 12345   # Graceful stop
kill -SIGKILL 12345   # Force kill

# Using signal numbers
kill -1 12345    # SIGHUP
kill -9 12345    # SIGKILL
kill -15 12345   # SIGTERM
```

#### killall - Kill by Name

```sh
# Kill all processes with name
Syntax:- killall <process_name>
Example:- killall nginx

# Kill forcefully
killall -9 nginx

# Interactive (confirm each)
killall -i nginx
```

#### pkill - Pattern-based Kill

```sh
# Kill by pattern
Syntax:- pkill <pattern>
Example:- pkill -f "python script.py"

# Kill by user
pkill -u username

# Kill by terminal
pkill -t pts/0
```

### Process Priority (nice/renice)

```sh
# Run command with lower priority (nice value: -20 to 19)
# Higher nice = lower priority (nicer to other processes)
nice -n 10 ./cpu_intensive_script.sh

# Run with higher priority (requires sudo)
sudo nice -n -5 ./important_script.sh

# Change priority of running process
Syntax:- renice <priority> -p <PID>
Example:- sudo renice -5 -p 12345
```

### Process Management Summary

| Command | Purpose |
|---------|---------|
| `ps aux` | List all processes |
| `top` / `htop` | Real-time process monitor |
| `jobs` | List background jobs |
| `fg %n` | Bring job to foreground |
| `bg %n` | Resume job in background |
| `kill PID` | Terminate process gracefully |
| `kill -9 PID` | Force kill process |
| `killall name` | Kill by process name |
| `pkill pattern` | Kill by pattern |
| `nice` / `renice` | Set/change priority |

---

## Webmin - GUI Administration

**Webmin** is a web-based system administration tool for Unix/Linux systems. It provides a graphical interface to manage:

- User accounts
- Apache, DNS, file sharing
- Package management
- Firewall configuration
- Cron jobs
- And much more

### Installing Webmin

```sh
# Method 1: Using the official repository (Recommended)

# Add Webmin repository key
curl -fsSL https://download.webmin.com/jcameron-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/webmin-archive-keyring.gpg

# Add repository
echo "deb [signed-by=/usr/share/keyrings/webmin-archive-keyring.gpg] https://download.webmin.com/download/repository sarge contrib" | sudo tee /etc/apt/sources.list.d/webmin.list

# Update and install
sudo apt update
sudo apt install webmin

# Method 2: Download .deb directly
wget https://prdownloads.sourceforge.net/webadmin/webmin_2.105_all.deb
sudo dpkg -i webmin_2.105_all.deb
sudo apt -f install  # Fix dependencies if needed
```

### Accessing Webmin

```sh
# Webmin runs on port 10000 by default
# Access via browser:
https://your-server-ip:10000

# Or for localhost:
https://localhost:10000

# Login with your Linux username and password
# (any user with sudo privileges)
```

### Firewall Configuration for Webmin

```sh
# Allow Webmin port in UFW
sudo ufw allow 10000/tcp

# Or for specific IP only
sudo ufw allow from 192.168.1.0/24 to any port 10000
```

### Webmin Configuration

```sh
# Main config file
/etc/webmin/miniserv.conf

# Change port (edit config file)
sudo nano /etc/webmin/miniserv.conf
# Find: port=10000
# Change to: port=YOUR_PORT

# Restart Webmin
sudo systemctl restart webmin

# Enable/disable Webmin
sudo systemctl enable webmin
sudo systemctl disable webmin

# Check status
sudo systemctl status webmin
```

### Key Webmin Features

| Category | Features |
|----------|----------|
| **System** | Bootup & Shutdown, Change Passwords, Cron Jobs, Disk & Network Filesystems |
| **Servers** | Apache, BIND DNS, MySQL, PostgreSQL, SSH, Postfix |
| **Networking** | Firewall (iptables/UFW), Network Configuration, Bandwidth Monitoring |
| **Hardware** | Partitions, RAID, Logical Volume Management |
| **Cluster** | Manage multiple servers from one interface |

### Security Best Practices for Webmin

```sh
# 1. Use HTTPS only (default)

# 2. Restrict access by IP
# Edit /etc/webmin/miniserv.conf
allow=192.168.1.0/24 127.0.0.1

# 3. Use non-standard port
port=12345

# 4. Enable two-factor authentication
# Webmin > Webmin Configuration > Two-Factor Authentication

# 5. Regularly update
sudo apt update && sudo apt upgrade webmin
```

---

## FileZilla - FTP/SFTP File Transfer

**FileZilla** is a popular cross-platform FTP, SFTP, and FTPS client for transferring files between local machine and remote servers.

### Installing FileZilla Client

```sh
# On Ubuntu Desktop
sudo apt update
sudo apt install filezilla

# On Windows/Mac
# Download from: https://filezilla-project.org/download.php
```

### Installing FileZilla Server (Optional - for FTP server)

For most cases, you'll use **SFTP** (SSH File Transfer Protocol) which uses your existing SSH server. No additional server installation needed!

If you specifically need FTP server:

```sh
# Install vsftpd (Very Secure FTP Daemon)
sudo apt install vsftpd

# Configure
sudo nano /etc/vsftpd.conf

# Common settings:
# anonymous_enable=NO
# local_enable=YES
# write_enable=YES
# chroot_local_user=YES

# Restart service
sudo systemctl restart vsftpd
```

### Connecting with FileZilla

#### SFTP Connection (Recommended - Uses SSH)

| Field | Value |
|-------|-------|
| Host | `sftp://your-server-ip` or just `your-server-ip` |
| Port | `22` (SSH default) |
| Protocol | SFTP - SSH File Transfer Protocol |
| Logon Type | Normal (password) or Key file |
| User | Your SSH username |
| Password | Your SSH password |

#### Using SSH Key with FileZilla

1. Open FileZilla
2. Go to **Edit > Settings > Connection > SFTP**
3. Click **Add key file**
4. Select your private key (`.pem` or `.ppk` file)
5. Connect using "Key file" as Logon Type

### FileZilla Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│  Host:     Port:    Username:    Password:    [Quickconnect]        │
├─────────────────────────────────────────────────────────────────────┤
│                         Message Log                                  │
├────────────────────────────┬────────────────────────────────────────┤
│      Local Site            │           Remote Site                  │
│  (Your Computer)           │         (Server)                       │
├────────────────────────────┼────────────────────────────────────────┤
│                            │                                        │
│   /home/user/Documents     │    /var/www/html                       │
│   ├── file1.txt            │    ├── index.html                      │
│   ├── file2.php            │    ├── style.css                       │
│   └── images/              │    └── uploads/                        │
│                            │                                        │
├────────────────────────────┴────────────────────────────────────────┤
│                      Transfer Queue                                  │
│  [Queued files] [Failed transfers] [Successful transfers]           │
└─────────────────────────────────────────────────────────────────────┘
```

### Common FileZilla Operations

| Action | How To |
|--------|--------|
| **Upload file** | Drag from left panel to right panel |
| **Download file** | Drag from right panel to left panel |
| **Edit remote file** | Right-click > View/Edit |
| **Change permissions** | Right-click > File permissions |
| **Create directory** | Right-click > Create directory |
| **Refresh** | Right-click > Refresh |
| **Bookmark site** | File > Site Manager > New Site |

### Site Manager (Save Connections)

```
File > Site Manager > New Site

Settings:
├── General Tab
│   ├── Protocol: SFTP - SSH File Transfer Protocol
│   ├── Host: your-server-ip
│   ├── Port: 22
│   ├── Logon Type: Normal / Key file
│   ├── User: username
│   └── Password: ********
├── Advanced Tab
│   ├── Default local directory: /home/user/projects
│   └── Default remote directory: /var/www/html
└── Transfer Settings
    └── Transfer mode: Binary (recommended)
```

### Alternatives to FileZilla

| Tool | Platform | Description |
|------|----------|-------------|
| **WinSCP** | Windows | Popular Windows SFTP/SCP client |
| **Cyberduck** | Mac/Windows | Free, supports cloud storage too |
| **Transmit** | Mac | Premium Mac file transfer app |
| **scp command** | Terminal | Command-line secure copy |
| **rsync** | Terminal | Efficient sync with progress |

### Command Line Alternatives

```sh
# SCP - Secure Copy
# Upload file
scp localfile.txt user@server:/remote/path/

# Download file
scp user@server:/remote/file.txt /local/path/

# Upload directory
scp -r localfolder/ user@server:/remote/path/

# SFTP - Interactive
sftp user@server
# Commands: ls, cd, get, put, mkdir, rm, exit
```

---

## Useful Links and Resources

### Official Documentation

| Resource | URL | Description |
|----------|-----|-------------|
| Ubuntu Documentation | https://help.ubuntu.com | Official Ubuntu help and guides |
| Ubuntu Server Guide | https://ubuntu.com/server/docs | Comprehensive server documentation |
| Linux man pages | https://linux.die.net/man | Command reference manual |
| DigitalOcean Tutorials | https://www.digitalocean.com/community/tutorials | Excellent practical tutorials |

### Learning Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Linux Journey | https://linuxjourney.com | Free interactive Linux learning |
| Linux Command | https://linuxcommand.org | Learning the Linux command line |
| Explainshell | https://explainshell.com | Explains shell commands visually |
| TLDR Pages | https://tldr.sh | Simplified man pages |

### System Administration Tools

| Tool | URL | Description |
|------|-----|-------------|
| Webmin | https://webmin.com | Web-based system administration |
| Cockpit | https://cockpit-project.org | Modern web interface for servers |
| FileZilla | https://filezilla-project.org | FTP/SFTP client |
| PuTTY | https://putty.org | SSH client for Windows |

### Monitoring Tools

| Tool | URL | Description |
|------|-----|-------------|
| htop | https://htop.dev | Interactive process viewer |
| Glances | https://nicolargo.github.io/glances | System monitoring tool |
| Netdata | https://netdata.cloud | Real-time performance monitoring |
| Prometheus | https://prometheus.io | Metrics and alerting |

### Useful Online Tools

| Tool | URL | Description |
|------|-----|-------------|
| Crontab Guru | https://crontab.guru | Cron expression editor |
| Chmod Calculator | https://chmod-calculator.com | Permission calculator |
| Regex101 | https://regex101.com | Regular expression tester |
| ShellCheck | https://shellcheck.net | Shell script analyzer |

---

## Quick Reference Cheat Sheet

### RAID Commands (mdadm)

| Task | Command |
|------|---------|
| Create RAID 0 | `sudo mdadm --create /dev/md0 --level=0 --raid-devices=2 /dev/sdb /dev/sdc` |
| Create RAID 1 | `sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc` |
| Check status | `cat /proc/mdstat` |
| Array details | `sudo mdadm --detail /dev/md0` |
| Add disk | `sudo mdadm --add /dev/md0 /dev/sdd` |
| Remove disk | `sudo mdadm --remove /dev/md0 /dev/sdc` |

### Cron

| Task | Command |
|------|---------|
| Edit crontab | `crontab -e` |
| List crontab | `crontab -l` |
| Remove crontab | `crontab -r` |
| System crontab | `sudo nano /etc/crontab` |

### Process Management

| Task | Command |
|------|---------|
| List processes | `ps aux` |
| Real-time monitor | `top` or `htop` |
| Background jobs | `jobs` |
| Foreground job | `fg %1` |
| Background job | `bg %1` |
| Kill process | `kill PID` or `kill -9 PID` |
| Kill by name | `killall process_name` |

### Common Cron Schedules

| Schedule | Expression |
|----------|------------|
| Every minute | `* * * * *` |
| Every 5 minutes | `*/5 * * * *` |
| Every hour | `0 * * * *` |
| Daily at midnight | `0 0 * * *` |
| Weekly (Sunday) | `0 0 * * 0` |
| Monthly (1st) | `0 0 1 * *` |

---

## Summary

This guide covered advanced Ubuntu server administration topics:

1. **RAID** - Understanding RAID 0, 1, and 10 configurations and mdadm setup
2. **Cron Jobs** - Scheduling automated tasks with crontab
3. **Process Management** - Using ps, top, kill, fg, bg for process control
4. **Webmin** - Web-based GUI for server administration
5. **FileZilla** - File transfer using FTP/SFTP
6. **Resources** - Useful links for continued learning

---

*See Part 1 for Linux fundamentals, user management, permissions, and file system basics.*
