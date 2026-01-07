# Ubuntu Server Administration - Part 1

A comprehensive guide covering Linux/Ubuntu fundamentals, user management, file permissions, networking basics, and file system management.

---

## Table of Contents

1. [What is Linux?](#what-is-linux)
2. [What is Ubuntu?](#what-is-ubuntu)
3. [Installing Ubuntu](#installing-ubuntu)
4. [Sudo & Root User](#sudo--root-user)
5. [Basic Terminal Commands](#basic-terminal-commands)
6. [Managing Output with Pagers](#managing-output-with-pagers)
7. [File Operations (mv, cp, rsync)](#file-operations-mv-cp-rsync)
8. [System Power Management](#system-power-management)
9. [Understanding Runlevels](#understanding-runlevels)
10. [Sudo, Su & User Switching](#sudo-su--user-switching)
11. [Date and Time Configuration](#date-and-time-configuration)
12. [User & Group Management](#user--group-management)
13. [Installing Programs with APT](#installing-programs-with-apt)
14. [Basic Networking](#basic-networking)
15. [File Permissions](#file-permissions)
16. [Access Control Lists (ACL)](#access-control-lists-acl)
17. [File System Management](#file-system-management)

---

## What is Linux?

**Pronunciation:** li-nex (rhymes with "cynics")

### History & Evolution

Linux is a free and open-source operating system kernel first released by **Linus Torvalds** in **1991**. The development of Linux was influenced by:

| OS | Description |
|----|-------------|
| **UNIX** | A powerful multi-user operating system developed in the 1970s at AT&T Bell Labs. It was proprietary and expensive. |
| **MINIX** | A minimal Unix-like OS created by Andrew Tanenbaum for educational purposes. Linus used MINIX while developing Linux. |
| **Linux** | Created as a free alternative to UNIX, combining the power of UNIX with open-source accessibility. |

### Key Characteristics

- **Open Source**: Anyone can view, modify, and distribute the source code
- **Free**: No licensing costs
- **Secure**: Strong permission and user management system
- **Stable**: Widely used in servers, cloud infrastructure, and embedded systems
- **Community-Driven**: Maintained by thousands of developers worldwide

---

## What is Ubuntu?

Ubuntu is a **Linux distribution** (distro) based on Debian. It's one of the most popular Linux distributions for both desktop and server use.

### The Linux Distribution Hierarchy

```
┌─────────────────────────────────────────────────┐
│                    Ubuntu                        │
│           (User-friendly distribution)           │
├─────────────────────────────────────────────────┤
│                    Debian                        │
│        (Stable, community-driven distro)         │
├─────────────────────────────────────────────────┤
│               Linux Kernel                       │
│     (The core/heart of the operating system)     │
└─────────────────────────────────────────────────┘
```

**Relationship:** `Ubuntu > Debian > Linux Kernel`

### Understanding the Linux Kernel

The **Linux Kernel** is the heart/core of the operating system. It:

- Manages hardware resources (CPU, memory, devices)
- Provides system calls for applications
- Handles process scheduling
- Manages file systems
- Controls network operations

**Debian** is built directly on top of the Linux kernel, adding package management, utilities, and system tools.

**Ubuntu** is built on Debian, adding user-friendly features, regular release cycles, and extensive documentation.

---

## Installing Ubuntu

### Hardware Requirements

For Ubuntu Server installation, you'll need:
- A spare PC or laptop (recommended for learning)
- Minimum 2GB RAM (4GB+ recommended)
- 25GB+ disk space
- USB drive (4GB or larger) or CD/DVD

### Installation Methods

| Method | Tool | Description |
|--------|------|-------------|
| **USB Drive** | Universal USB Installer / Rufus / Balena Etcher | Most common method. Creates a bootable USB from Ubuntu ISO |
| **CD/DVD** | Any burning software | Burn ISO to disc and boot from it |
| **Virtual Machine** | VirtualBox / VMware | Best for testing without affecting main system |

### Creating Bootable USB (Using Universal USB Installer)

1. Download Ubuntu Server ISO from [ubuntu.com](https://ubuntu.com/download/server)
2. Download Universal USB Installer
3. Select Ubuntu from the dropdown
4. Browse to the downloaded ISO file
5. Select your USB drive
6. Click "Create"

> ⚠️ **Warning**: Creating a bootable USB will erase all data on the USB drive.

---

## Sudo & Root User

### Understanding Root User

The **root user** (also called superuser) is the administrative account in Linux with:

- Complete access to all files and commands
- Ability to modify any system configuration
- Power to add/remove users and software
- UID (User ID) of 0

### Security Best Practices

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠️  NEVER login directly as root on an Ubuntu server!         │
│                                                                 │
│  • Root account is created automatically but unauthenticated   │
│  • Keep root account locked (default behavior)                 │
│  • Use sudo for administrative tasks                           │
│  • This prevents accidental system damage                      │
│  • Provides audit trail of administrative actions              │
└────────────────────────────────────────────────────────────────┘
```

### What is Sudo?

**Sudo** stands for "**S**uper **U**ser **DO**" - it allows permitted users to execute commands as root (or another user).

```sh
# Without sudo - permission denied for system files
cat /etc/shadow

# With sudo - executes with root privileges
sudo cat /etc/shadow
```

When you install Ubuntu and create a user, that user is automatically added to the **sudo group**, giving them administrative privileges without enabling the root account.

---

## Basic Terminal Commands

### Navigation Commands

| Command | Description | Example |
|---------|-------------|---------|
| `ls` | List contents of current directory | `ls`, `ls -la` |
| `cd` | Change directory | `cd /var/log` |
| `pwd` | Print working directory (show current path) | `pwd` |

### Understanding Directory Symbols

```sh
cd /      # Go to root directory (top-level of file system)
cd ~      # Go to home directory (/home/username)
cd        # Same as cd ~ (go to home directory)
cd ..     # Go up one directory level
cd ../..  # Go up two directory levels
cd -      # Go to previous directory
```

### Root vs Home Directory

| Directory | Path | Purpose |
|-----------|------|---------|
| **Root Directory** | `/` | The top-level directory of the entire file system. Contains all other directories. |
| **Home Directory** | `/home/username` or `~` | Personal directory for each user. Stores user files, configs, and settings. |

### Creating and Removing Directories

```sh
# Create a directory
mkdir my_folder
mkdir -p parent/child/grandchild  # Create nested directories

# Remove an empty directory
rmdir my_folder

# Remove directory with contents (recursive)
rm -r my_folder

# Remove with force (no confirmation prompts)
rm -rf my_folder  # ⚠️ Use with caution!
```

### File Color Coding in Terminal

| Color | Type |
|-------|------|
| **Blue** | Directory |
| **White** | Regular file |
| **Green** | Executable file |
| **Cyan** | Symbolic link |
| **Red** | Compressed/archive file |

### Text Editors

```sh
# Nano - Simple, beginner-friendly editor
nano filename.txt

# Nano Shortcuts:
# Ctrl + O  = Save file
# Ctrl + X  = Exit
# Ctrl + K  = Cut line
# Ctrl + U  = Paste line
# Ctrl + W  = Search
```

### Executing Multiple Commands

```sh
# Using && (AND operator)
# Second command runs ONLY if first succeeds
mkdir test && cd test && touch file.txt

# Using ; (semicolon)
# Commands run regardless of previous command's success
mkdir test; cd test; touch file.txt

# Using | (pipe)
# Passes output of first command as input to second
cat file.txt | grep "search_term"
```

### Difference Between `&&` and `|`

| Operator | Name | Behavior |
|----------|------|----------|
| `&&` | AND | Executes commands **sequentially**. Second command runs only if first succeeds. |
| `\|` | Pipe | Passes **output** of first command as **input** to second command. Runs in parallel. |

```sh
# Example of &&
cat test.txt && cd /  # First reads file, then changes directory

# Example of |
cat syslog | less     # Output of cat becomes input for less
```

### Best Practices for Naming

```sh
# ❌ Avoid spaces in folder/file names
mkdir my folder    # Creates two folders: "my" and "folder"

# ✅ Use underscores or hyphens
mkdir my_folder
mkdir my-folder

# If you must use spaces, quote the name
mkdir "my folder"
cd "my folder"
```

---

## Managing Output with Pagers

When file contents are too long to fit on screen, use **pagers** to navigate through them.

### Available Pagers

| Command | Description | Navigation |
|---------|-------------|------------|
| `less` | View file with scroll capability | ↑↓ arrows, Page Up/Down, `q` to quit |
| `more` | View file (forward only) | Space for next page, `q` to quit |
| `grep` | Search and filter text | Shows matching lines only |

### Usage Examples

```sh
# View long file with less (recommended)
cat /var/log/syslog | less
# Or directly:
less /var/log/syslog

# View with more (forward-only navigation)
cat /var/log/syslog | more

# Search for specific text (highlighted)
cat /var/log/syslog | grep "error"

# Case-insensitive search
cat /var/log/syslog | grep -i "error"

# Show line numbers with matches
cat /var/log/syslog | grep -n "error"

# Count matching lines
cat /var/log/syslog | grep -c "error"
```

### Less Navigation Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Scroll line by line |
| `Page Up` / `Page Down` | Scroll page by page |
| `g` | Go to beginning of file |
| `G` | Go to end of file |
| `/pattern` | Search forward for pattern |
| `?pattern` | Search backward for pattern |
| `n` | Next search match |
| `N` | Previous search match |
| `q` | Quit |

---

## File Operations (mv, cp, rsync)

### Moving and Renaming Files (mv)

```sh
# Move file to another directory
Syntax:- mv <source> <destination>
Example:- mv file.txt /home/user/documents/

# Rename a file
Syntax:- mv <old_name> <new_name>
Example:- mv old_name.txt new_name.txt

# Rename a folder
mv old_folder new_folder

# Move multiple files
mv file1.txt file2.txt /destination/
```

### Copying Files and Directories (cp)

```sh
# Copy a file
Syntax:- cp <source> <destination>
Example:- cp file.txt /backup/

# Copy to home directory
cp file.txt ~

# Copy directory (recursive - required for directories)
Syntax:- cp -R <source_directory> <destination>
Example:- cp -R my_folder /backup/

# Copy with verbose output
cp -Rv my_folder /backup/

# Preserve file attributes (permissions, timestamps)
cp -Rp my_folder /backup/
```

### Syncing Files with rsync (Recommended for Large Files)

**rsync** is superior to `cp` for large files because:
- Shows progress during transfer
- Can resume interrupted transfers
- Only copies changed portions of files
- Provides detailed transfer information

```sh
# Basic rsync with progress
Syntax:- rsync -avzP <source> <destination>
Example:- rsync -avzP large_folder/ /backup/

# Flags explained:
# -a = Archive mode (preserves permissions, timestamps, etc.)
# -v = Verbose output
# -z = Compress during transfer
# -P = Show progress + allow resume of interrupted transfers
```

### Comparison: cp vs rsync

| Feature | cp | rsync |
|---------|-----|-------|
| Progress display | ❌ No | ✅ Yes |
| Resume transfer | ❌ No | ✅ Yes |
| Incremental copy | ❌ No | ✅ Yes |
| Network transfer | ❌ No | ✅ Yes |
| Compression | ❌ No | ✅ Yes |

---

## System Power Management

### Shutdown Commands

```sh
# Shutdown immediately
sudo shutdown -h now

# Shutdown with message
sudo shutdown -h now "System maintenance in progress"

# Shutdown in 10 minutes
sudo shutdown -h +10

# Shutdown at specific time
sudo shutdown -h 22:00

# Cancel scheduled shutdown
sudo shutdown -c
```

**Flags:**
- `-h` = Halt (power off the system)
- `-r` = Reboot
- `+N` = Shutdown in N minutes
- `now` = Immediately

### Reboot Commands

```sh
# Reboot immediately
sudo reboot

# Alternative reboot command
sudo shutdown -r now

# Reboot in 5 minutes
sudo shutdown -r +5
```

---

## Understanding Runlevels

**Runlevels** define the state of the machine and which services are running.

### Traditional SysV Runlevels

| Runlevel | Mode | Description |
|----------|------|-------------|
| 0 | Halt | System shutdown |
| 1 | Single User | Maintenance mode, no network |
| 2 | Multi-User | Multi-user, no network (Debian/Ubuntu default) |
| 3 | Multi-User + Network | Full multi-user with networking (servers) |
| 4 | Unused | Custom/undefined |
| 5 | Graphical | Multi-user with GUI (desktop) |
| 6 | Reboot | System reboot |

### Modern Systemd Targets

Ubuntu now uses **systemd** instead of traditional runlevels:

| Runlevel | Systemd Target | Description |
|----------|----------------|-------------|
| 0 | poweroff.target | Shutdown |
| 1 | rescue.target | Single user/rescue mode |
| 3 | multi-user.target | Multi-user CLI |
| 5 | graphical.target | Multi-user GUI |
| 6 | reboot.target | Reboot |

```sh
# Check current runlevel/target
runlevel
systemctl get-default

# Change default target
sudo systemctl set-default multi-user.target

# Switch to different target temporarily
sudo systemctl isolate rescue.target
```

---

## Sudo, Su & User Switching

### Understanding the Sudo Group

**sudo** is not just a command—it's also a **group**. Users in the sudo group can execute commands with root privileges.

```sh
# Check if current user is in sudo group
groups

# Check groups for specific user
groups username
```

### The Ubuntu User on EC2

When you create an AWS EC2 instance with Ubuntu:
- A user named `ubuntu` is created automatically
- `ubuntu` is NOT the root user
- `ubuntu` is added to the sudo group
- Root user exists but is **not authenticated** (locked)

### Switching Users with su

```sh
# Switch to another user
Syntax:- su <username>
Example:- su rahul
# Enter rahul's password when prompted

# Switch to root (if root is enabled - not recommended)
su -
# or
su root
```

### Understanding sudo su

```sh
# Execute shell as root (without root password)
sudo su

# This works because:
# 1. sudo authenticates YOU (your password)
# 2. Then switches to root shell
# 3. Root account itself remains locked
```

### Key Differences

| Command | Requires | Result |
|---------|----------|--------|
| `su username` | Target user's password | Switch to that user |
| `sudo command` | Your password (if in sudo group) | Run single command as root |
| `sudo su` | Your password (if in sudo group) | Get root shell |
| `sudo -i` | Your password (if in sudo group) | Get root shell (preferred) |

### Security Note

```
┌──────────────────────────────────────────────────────────────────┐
│  The root account is LOCKED by default in Ubuntu.                │
│                                                                   │
│  ✅ Best Practice: Keep it locked!                               │
│  ✅ Use sudo for administrative tasks                            │
│  ✅ Creates audit trail in /var/log/auth.log                     │
│                                                                   │
│  ❌ Don't run: sudo passwd root (enables root login)             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Date and Time Configuration

### Viewing Date and Time

```sh
# Display current date and time
date

# Display in specific format
date "+%Y-%m-%d %H:%M:%S"

# Display timezone
timedatectl
```

### Setting Date and Time

```sh
# Set date (requires sudo)
Syntax:- sudo date -s "YYYY-MM-DD HH:MM:SS"
Example:- sudo date -s "2024-01-15 14:30:00"

# Set timezone
sudo timedatectl set-timezone Asia/Kolkata

# List available timezones
timedatectl list-timezones

# Enable NTP (automatic time sync)
sudo timedatectl set-ntp true
```

### Common Date Format Codes

| Code | Meaning | Example |
|------|---------|---------|
| `%Y` | Year (4 digits) | 2024 |
| `%m` | Month (01-12) | 01 |
| `%d` | Day (01-31) | 15 |
| `%H` | Hour (00-23) | 14 |
| `%M` | Minute (00-59) | 30 |
| `%S` | Second (00-59) | 00 |
| `%Z` | Timezone | IST |

---

## User & Group Management

### Creating Users

```sh
# Add new user (interactive - asks for details)
Syntax:- sudo adduser <username>
Example:- sudo adduser john

# Prompts for:
# - Password (required)
# - Full Name (optional)
# - Room Number (optional)
# - Work Phone (optional)
# - Home Phone (optional)
# - Other (optional)
```

### Creating Groups

```sh
# Create a new group
Syntax:- sudo addgroup <groupname>
Example:- sudo addgroup developers
```

### Viewing Groups

```sh
# Show groups current user belongs to
groups

# Show groups for specific user
groups username

# List all groups on system
cat /etc/group

# List all users on system
cat /etc/passwd
```

### Managing User-Group Relationships

```sh
# Add user to a group
Syntax:- sudo adduser <username> <groupname>
Example:- sudo adduser john developers

# Remove user from a group
Syntax:- sudo deluser <username> <groupname>
Example:- sudo deluser john developers

# Add user to sudo group (grant admin privileges)
sudo adduser john sudo
```

### Deleting Users and Groups

```sh
# Delete a user (keeps home directory)
Syntax:- sudo deluser <username>
Example:- sudo deluser john

# Delete user AND their home directory
sudo deluser --remove-home john

# Delete a group
Syntax:- sudo groupdel <groupname>
Example:- sudo groupdel developers
```

### Changing Passwords

```sh
# Change your own password
passwd

# Change another user's password (requires sudo)
sudo passwd username

# Note: Sudo users can change any user's password
# without knowing that user's current password
```

### Understanding /etc/passwd Format

```
username:x:UID:GID:Full Name:Home Directory:Shell
john:x:1001:1001:John Doe:/home/john:/bin/bash
```

| Field | Description |
|-------|-------------|
| username | Login name |
| x | Password placeholder (actual password in /etc/shadow) |
| UID | User ID number |
| GID | Primary group ID |
| Full Name | User's full name/comment |
| Home Directory | User's home folder |
| Shell | Default shell |

---

## Installing Programs with APT

APT (Advanced Package Tool) is Ubuntu's package management system.

### Package Management Commands

```sh
# Search for a package
Syntax:- apt-cache search <package-name>
Example:- apt-cache search nginx

# Update package index (does NOT install updates)
sudo apt-get update
# or
sudo apt update

# Upgrade installed packages to newer versions
sudo apt-get upgrade
# or
sudo apt upgrade

# Install a package
Syntax:- sudo apt-get install <package-name>
Example:- sudo apt-get install nginx

# Remove a package
sudo apt-get remove nginx

# Remove package with config files
sudo apt-get purge nginx

# Remove unused dependencies
sudo apt-get autoremove
```

### Understanding Update vs Upgrade

| Command | Action |
|---------|--------|
| `apt update` | Downloads package information from repositories. Updates the **index/list** of available packages. Does NOT install anything. |
| `apt upgrade` | Installs newer versions of packages you have. Uses the updated index from `apt update`. |

> 💡 **Always run `apt update` before `apt upgrade`**

### Package Repository Configuration

```sh
# View/edit package sources
sudo nano /etc/apt/sources.list

# Add third-party repositories
sudo add-apt-repository ppa:repository-name
```

### Upgrading Ubuntu Version

```sh
# Upgrade to next Ubuntu release
sudo do-release-upgrade

# Check available upgrade
do-release-upgrade -c
```

---

## Basic Networking

### Network Information Commands

```sh
# Show network interfaces (deprecated but still works)
ifconfig

# Modern alternative
ip addr
ip a

# Show routing table
ip route

# Show only IPv4 addresses
ip -4 addr
```

### Testing Connectivity

```sh
# Ping a server (Ctrl+C to stop)
ping google.com

# Ping with limited count
ping -c 4 google.com

# Check DNS resolution
nslookup google.com
dig google.com
```

### Network Configuration Files

```sh
# View/change hostname
cat /etc/hostname
sudo nano /etc/hostname

# Apply hostname change immediately
sudo hostnamectl set-hostname new-hostname

# Map IP addresses to hostnames
sudo nano /etc/hosts

# Example /etc/hosts entry:
# 192.168.1.100  myserver.local  myserver

# Configure network interfaces (older systems)
sudo nano /etc/network/interfaces

# Modern Ubuntu uses Netplan
sudo nano /etc/netplan/00-installer-config.yaml
```

### Example /etc/hosts

```
127.0.0.1       localhost
127.0.1.1       my-ubuntu-server

# Custom entries
192.168.1.10    database-server db
192.168.1.20    web-server web
```

---

## File Permissions

### Viewing Permissions

```sh
# List files with permissions
ls -l

# Output example:
# drwxr-xr-x   2 root root   4096 Dec 24 11:17 reports
# -rw-r--r--   1 root root   7587 Jan  3 06:52 server.js
```

### Understanding the 9-Bit Permission Model

```
drwxr-xr-x   2 root root   4096 Dec 24 11:17 reports
│└┬─┘└┬─┘└┬─┘
│ │   │   │
│ │   │   └── Other (everyone else)
│ │   └────── Group (group members)
│ └────────── Owner (file owner)
└──────────── File type (d=directory, -=file, l=link)
```

### Permission Characters

| Character | Meaning | Numeric Value |
|-----------|---------|---------------|
| `r` | Read | 4 |
| `w` | Write | 2 |
| `x` | Execute | 1 |
| `-` | No permission | 0 |

### Numeric Permission Values

Permissions are calculated by adding values:

| Permission | Calculation | Value |
|------------|-------------|-------|
| `---` | 0+0+0 | 0 |
| `--x` | 0+0+1 | 1 |
| `-w-` | 0+2+0 | 2 |
| `-wx` | 0+2+1 | 3 |
| `r--` | 4+0+0 | 4 |
| `r-x` | 4+0+1 | 5 |
| `rw-` | 4+2+0 | 6 |
| `rwx` | 4+2+1 | 7 |

### Common Permission Combinations

| Numeric | Symbolic | Meaning |
|---------|----------|---------|
| `777` | `rwxrwxrwx` | Full access for everyone (⚠️ dangerous) |
| `755` | `rwxr-xr-x` | Owner: full, Others: read+execute |
| `644` | `rw-r--r--` | Owner: read+write, Others: read only |
| `600` | `rw-------` | Owner only: read+write |
| `700` | `rwx------` | Owner only: full access |

### Changing Permissions (chmod)

```sh
# Using numeric mode
Syntax:- chmod <permissions> <filename>
Example:- chmod 755 script.sh

# Using symbolic mode
chmod u+x script.sh      # Add execute for owner
chmod g-w file.txt       # Remove write for group
chmod o=r file.txt       # Set other to read only
chmod a+r file.txt       # Add read for all

# Symbols:
# u = user (owner)
# g = group
# o = other
# a = all
# + = add permission
# - = remove permission
# = = set exact permission

# Recursive (for directories)
chmod -R 755 my_folder/
```

### Changing Ownership (chown)

```sh
# Change owner
Syntax:- sudo chown <user> <filename>
Example:- sudo chown john file.txt

# Change owner and group
Syntax:- sudo chown <user>:<group> <filename>
Example:- sudo chown john:developers file.txt

# Change group only
sudo chgrp developers file.txt

# Recursive ownership change
sudo chown -R john:developers my_folder/
```

---

## Access Control Lists (ACL)

ACLs provide more fine-grained permissions beyond the standard owner/group/other model.

### Installing ACL

```sh
sudo apt-get install acl
```

### When to Use ACL

Standard permissions only allow:
- One owner
- One group
- Everyone else (other)

ACL allows:
- Multiple users with different permissions
- Multiple groups with different permissions
- Default permissions for new files in directories

### ACL Commands

```sh
# View ACL permissions
Syntax:- getfacl <filename>
Example:- getfacl myfile.txt

# Output example:
# file: myfile.txt
# owner: root
# group: root
# user::rw-
# user:john:rwx
# group::r--
# mask::rwx
# other::r--

# Set ACL permission for a user
Syntax:- setfacl -m u:<username>:<permissions> <filename>
Example:- setfacl -m u:john:rwx important_file.txt

# Set ACL permission for a group
setfacl -m g:developers:rw important_file.txt

# Set default ACL for directory (new files inherit)
Syntax:- setfacl -m d:u:<username>:<permissions> <directory>
Example:- setfacl -m d:u:john:rwx /shared/projects/

# Remove ACL for a user
Syntax:- setfacl -x u:<username> <filename>
Example:- setfacl -x u:john important_file.txt

# Remove all ACLs
setfacl -b filename
```

### ACL Flags Explained

| Flag | Description |
|------|-------------|
| `-m` | Modify ACL entries |
| `-x` | Remove specific ACL entry |
| `-b` | Remove all ACL entries |
| `-d` | Set default ACL (for directories) |
| `-R` | Recursive (apply to all files in directory) |

### ACL Indicator in ls -l

When a file has ACL, you'll see a `+` sign:

```sh
ls -l
# -rw-r--r--+ 1 root root 1234 Jan 1 12:00 file_with_acl.txt
#          ^
#          └── Plus sign indicates ACL is set
```

---

## File System Management

### Disk Space Commands

```sh
# Show disk space of all mounted file systems
df -h

# Output example:
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       50G   15G   32G  32% /
# /dev/sdb1      100G   45G   50G  48% /data

# Flags:
# -h = Human-readable (KB, MB, GB)
# -T = Show filesystem type
```

### Disk Usage Commands

```sh
# Show size of a file or directory
Syntax:- du -h <path>
Example:- du -h /var/log

# Show disk usage with max depth
du -h --max-depth=1 /home

# Show only total
du -sh /home/user

# Find largest directories
du -h --max-depth=1 / | sort -hr | head -20
```

### Viewing Mounted File Systems

```sh
# Show all mounted file systems
mount

# Show specific mount info
mount | grep sda

# Show mount points in readable format
lsblk
```

### Mounting and Unmounting

```sh
# Mount a device
Syntax:- sudo mount <device> <mount-point>
Example:- sudo mount /dev/sdb1 /mnt

# Mount with specific filesystem type
sudo mount -t ext4 /dev/sdb1 /mnt

# Unmount a filesystem
Syntax:- sudo umount <mount-point>
Example:- sudo umount /mnt

# Force unmount (if busy)
sudo umount -f /mnt

# Lazy unmount (when device is busy)
sudo umount -l /mnt
```

### Disk Partitioning

```sh
# List all partitions on all devices
sudo fdisk -l

# Output shows:
# - Device name (/dev/sda, /dev/sdb)
# - Partition table type
# - Each partition with size and type

# Interactive partition management
Syntax:- sudo fdisk <device>
Example:- sudo fdisk /dev/sdb

# Using parted (supports larger disks)
Syntax:- sudo parted <device>
Example:- sudo parted /dev/sdb

# Parted commands:
# print    - Show partitions
# mkpart   - Create partition
# rm       - Remove partition
# resizepart - Resize partition
# quit     - Exit parted
```

### Common Partition Operations with fdisk

```sh
sudo fdisk /dev/sdb

# Inside fdisk:
# m - Help menu
# p - Print partition table
# n - New partition
# d - Delete partition
# t - Change partition type
# w - Write changes and exit
# q - Quit without saving
```

### Persistent Mounting with /etc/fstab

```sh
# Edit fstab for permanent mounts
sudo nano /etc/fstab

# Format:
# <device>    <mount-point>  <type>  <options>     <dump> <pass>
# /dev/sdb1   /data          ext4    defaults      0      2
# UUID=xxx    /backup        ext4    defaults      0      2

# Find UUID of a device
sudo blkid /dev/sdb1

# Test fstab without rebooting
sudo mount -a
```

---

## Quick Reference Cheat Sheet

### Essential Commands

| Task | Command |
|------|---------|
| List files | `ls -la` |
| Change directory | `cd /path` |
| Create directory | `mkdir name` |
| Remove directory | `rm -r name` |
| Copy files | `cp -R source dest` |
| Move/rename | `mv old new` |
| Edit file | `nano filename` |
| View file | `cat filename` |
| Search in file | `grep "text" file` |
| Find files | `find / -name "*.txt"` |

### User Management

| Task | Command |
|------|---------|
| Add user | `sudo adduser username` |
| Delete user | `sudo deluser username` |
| Add group | `sudo addgroup groupname` |
| Add user to group | `sudo adduser user group` |
| Change password | `sudo passwd username` |
| View groups | `groups username` |

### Permissions

| Task | Command |
|------|---------|
| View permissions | `ls -l` |
| Change permissions | `chmod 755 file` |
| Change owner | `sudo chown user:group file` |
| View ACL | `getfacl file` |
| Set ACL | `setfacl -m u:user:rwx file` |

### System

| Task | Command |
|------|---------|
| Update packages | `sudo apt update` |
| Upgrade packages | `sudo apt upgrade` |
| Install package | `sudo apt install name` |
| Check disk space | `df -h` |
| Check folder size | `du -sh /path` |
| Shutdown | `sudo shutdown -h now` |
| Reboot | `sudo reboot` |

---

## Summary

This guide covered the fundamental concepts of Ubuntu server administration:

1. **Linux/Ubuntu Basics** - Understanding the OS hierarchy and kernel
2. **User Security** - Proper use of sudo and root account management
3. **Terminal Navigation** - Essential commands for daily operations
4. **File Operations** - Moving, copying, and syncing files efficiently
5. **User Management** - Creating and managing users and groups
6. **Package Management** - Installing and updating software with APT
7. **Networking** - Basic network configuration and troubleshooting
8. **Permissions** - The 9-bit model and Access Control Lists
9. **File Systems** - Disk management, mounting, and partitioning

---

*Part 2 will cover advanced topics like SSH configuration, web server deployment, and more.*
