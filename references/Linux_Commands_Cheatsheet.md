# Linux Commands Cheatsheet

> Last Updated: February 22, 2026

## Table of Contents
- [Navigation](#navigation)
- [File and Directory Operations](#file-and-directory-operations)
- [File Content](#file-content)
- [Permissions](#permissions)
- [Search and Find](#search-and-find)
- [Process Management](#process-management)
- [Disk and Memory](#disk-and-memory)
- [Networking](#networking)
- [Package Management (apt)](#package-management-apt)
- [Compression and Archives](#compression-and-archives)
- [User Management](#user-management)
- [System Information](#system-information)
- [Text Processing](#text-processing)

---

## Navigation

```bash
pwd                         # Print current directory
cd /path/to/dir             # Change directory
cd ~                        # Go to home directory
cd ..                       # Go up one level
cd -                        # Go to previous directory
ls                          # List files
ls -la                      # List all files with details
ls -lh                      # List with human-readable sizes
ls -lt                      # List sorted by modification time
```

---

## File and Directory Operations

```bash
# Create
touch file.txt              # Create empty file
mkdir mydir                 # Create directory
mkdir -p a/b/c              # Create nested directories

# Copy
cp file.txt copy.txt        # Copy file
cp -r dir1 dir2             # Copy directory recursively

# Move / Rename
mv old.txt new.txt          # Rename file
mv file.txt /path/to/       # Move file

# Delete
rm file.txt                 # Delete file
rm -rf mydir                # Delete directory and contents
rmdir emptydir              # Delete empty directory

# Symlinks
ln -s /path/to/target link  # Create symbolic link
```

---

## File Content

```bash
cat file.txt                # Print entire file
head -n 20 file.txt         # First 20 lines
tail -n 20 file.txt         # Last 20 lines
tail -f logfile.log         # Follow file in real-time
less file.txt               # Scroll through file (q to quit)
wc -l file.txt              # Count lines
wc -w file.txt              # Count words
diff file1 file2            # Compare files
```

---

## Permissions

```bash
# Format: rwx (read=4, write=2, execute=1)
chmod 755 file.txt          # rwxr-xr-x (owner=rwx, group=rx, others=rx)
chmod 644 file.txt          # rw-r--r--
chmod +x script.sh          # Add execute permission
chmod -w file.txt           # Remove write permission

# Ownership
chown user:group file.txt   # Change owner and group
chown -R user:group dir/    # Recursive ownership change

# Common permission values
# 777 - rwxrwxrwx (everyone can do everything - avoid)
# 755 - rwxr-xr-x (directories, scripts)
# 644 - rw-r--r-- (files)
# 600 - rw------- (private files, keys)
# 400 - r-------- (SSH keys)
```

---

## Search and Find

```bash
# Find files
find / -name "file.txt"                    # Find by name
find . -name "*.log"                        # Find by pattern
find . -type d -name "node_modules"         # Find directories
find . -type f -size +100M                  # Files larger than 100MB
find . -type f -mtime -7                    # Modified in last 7 days
find . -type f -name "*.log" -delete        # Find and delete

# Search file contents
grep "search term" file.txt                 # Search in file
grep -r "search term" /path/                # Search recursively
grep -rn "search term" .                    # Search with line numbers
grep -ri "search" .                         # Case-insensitive
grep -rl "search" .                         # List matching files only
grep -v "exclude" file.txt                  # Lines NOT matching

# Which / Where
which node                                  # Path to executable
whereis nginx                               # Location of binary/docs
```

---

## Process Management

```bash
ps aux                      # List all processes
ps aux | grep node          # Search for specific process
top                         # Real-time process monitor
htop                        # Better process monitor (install: apt install htop)

kill PID                    # Terminate process
kill -9 PID                 # Force kill
killall node                # Kill all processes by name

# Background processes
command &                   # Run in background
nohup command &             # Run and persist after logout
jobs                        # List background jobs
fg %1                       # Bring job 1 to foreground
bg %1                       # Resume job 1 in background

# System services
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl status nginx
sudo systemctl enable nginx     # Start on boot
sudo systemctl disable nginx    # Don't start on boot
```

---

## Disk and Memory

```bash
# Disk usage
df -h                       # Disk space (human-readable)
du -sh /path/to/dir         # Size of directory
du -sh * | sort -rh         # Size of items in current dir, sorted
ncdu /path                  # Interactive disk usage (install: apt install ncdu)

# Memory
free -m                     # Memory in MB
free -h                     # Memory human-readable

# Disk I/O
iostat                      # Disk I/O statistics
lsblk                       # List block devices
```

---

## Networking

```bash
# Network info
ip addr                     # Show IP addresses
ifconfig                    # Show network interfaces
hostname -I                 # Show server IP

# Testing
ping google.com             # Test connectivity
curl https://example.com    # Fetch URL
wget https://example.com/file.zip   # Download file

# Ports
sudo netstat -tlnp          # List listening ports
sudo ss -tlnp               # List listening ports (modern)
sudo lsof -i :3000          # What is using port 3000

# DNS
nslookup domain.com         # DNS lookup
dig domain.com              # Detailed DNS lookup

# Transfer
scp file.txt user@host:/path/           # Copy file to remote
scp user@host:/path/file.txt ./         # Copy from remote
rsync -avz ./dir user@host:/path/       # Sync directory
```

---

## Package Management (apt)

```bash
sudo apt update                         # Update package list
sudo apt upgrade -y                     # Upgrade all packages
sudo apt install package-name           # Install package
sudo apt remove package-name            # Remove package
sudo apt autoremove                     # Remove unused packages
sudo apt search package-name            # Search for package
sudo apt list --installed               # List installed packages
dpkg -l | grep package                  # Check if package is installed
```

---

## Compression and Archives

```bash
# tar (tape archive)
tar -czf archive.tar.gz dir/            # Create gzip archive
tar -xzf archive.tar.gz                 # Extract gzip archive
tar -xzf archive.tar.gz -C /path/       # Extract to specific path
tar -tf archive.tar.gz                  # List contents

# zip
zip -r archive.zip dir/                 # Create zip
unzip archive.zip                       # Extract zip
unzip archive.zip -d /path/             # Extract to specific path

# gzip
gzip file.txt                           # Compress (replaces original)
gunzip file.txt.gz                      # Decompress
```

---

## User Management

```bash
# Users
sudo adduser username                   # Create user (interactive)
sudo useradd username                   # Create user
sudo userdel username                   # Delete user
sudo userdel -r username                # Delete user and home directory
sudo passwd username                    # Set/change password
sudo usermod -aG sudo username          # Add to sudo group

# Groups
groups username                         # Show user's groups
sudo groupadd groupname                 # Create group
sudo usermod -aG groupname username     # Add user to group

# Switch user
su - username                           # Switch to user
sudo -i                                 # Switch to root
whoami                                  # Current username
id                                      # User ID and groups
```

---

## System Information

```bash
uname -a                    # System info
lsb_release -a              # Ubuntu/Debian version
cat /etc/os-release         # OS details
uptime                      # System uptime
date                        # Current date and time
timedatectl                 # Timezone info
hostnamectl                 # Hostname info
nproc                       # Number of CPU cores
cat /proc/cpuinfo           # CPU details
cat /proc/meminfo           # Memory details
```

---

## Text Processing

```bash
# Sort
sort file.txt               # Sort lines
sort -r file.txt            # Reverse sort
sort -n file.txt            # Numeric sort
sort -u file.txt            # Sort and remove duplicates

# Cut
cut -d',' -f1 file.csv      # Get first column (comma delimiter)
cut -d':' -f1 /etc/passwd   # Get usernames

# awk
awk '{print $1}' file.txt          # Print first column
awk -F',' '{print $2}' file.csv    # CSV second column

# sed
sed 's/old/new/g' file.txt         # Replace all occurrences
sed -i 's/old/new/g' file.txt      # Replace in-place
sed -n '5,10p' file.txt            # Print lines 5-10

# Pipe combinations
cat access.log | grep "404" | wc -l      # Count 404 errors
ps aux | sort -nk 3 | tail -5            # Top 5 CPU processes
```
