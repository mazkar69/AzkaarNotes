# AWS EBS Volume Resize - Complete Guide

## Overview

This guide shows how to resize an already attached EBS (Elastic Block Store) volume on an EC2 instance without data loss.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Modify EBS Volume in AWS Console](#step-1-modify-ebs-volume-in-aws-console)
- [Step 2: Check Current Volume Status](#step-2-check-current-volume-status)
- [Step 3: Identify Filesystem Type](#step-3-identify-filesystem-type)
- [Step 4: Resize the Filesystem](#step-4-resize-the-filesystem)
- [Step 5: Verify Changes](#step-5-verify-changes)
- [Troubleshooting](#troubleshooting)
- [Important Notes](#important-notes)

---

## Prerequisites

- EC2 instance is running
- EBS volume is attached to the instance
- SSH access to the instance
- Root/sudo privileges

**⚠️ Warning**: Always backup your data before resizing volumes!

---

## Step 1: Modify EBS Volume in AWS Console

### Using AWS Console

1. Go to **AWS Management Console**
2. Navigate to **EC2** → **Volumes** (left sidebar under Elastic Block Store)
3. **Select your volume** (the one attached to your instance)
4. Click **Actions** → **Modify Volume**
5. **Change Size** to desired value (e.g., from 8 GB to 20 GB)
6. Click **Modify**
7. Confirm the modification

### Using AWS CLI

```bash
# Get volume ID
aws ec2 describe-volumes --filters "Name=attachment.instance-id,Values=i-1234567890abcdef0"

# Modify volume size (example: resize to 20 GB)
aws ec2 modify-volume --volume-id vol-1234567890abcdef0 --size 20

# Check modification status
aws ec2 describe-volumes-modifications --volume-id vol-1234567890abcdef0
```

**Note**: The modification happens immediately in AWS, but the OS needs to be told to use the new space.

---

## Step 2: Check Current Volume Status

### List All Block Devices

```bash
# List all block devices with sizes
lsblk
```

**Example Output:**
```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk 
└─xvda1 202:1    0   8G  0 part /
xvdf    202:80   0  20G  0 disk /data
```

**Explanation:**
- `lsblk` shows the **updated size** (20G in this case)
- The volume has been resized at the block level
- But the filesystem still thinks it's the old size

### Check Filesystem Usage

```bash
# Check disk usage
df -h
```

**Example Output (Before Resize):**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1      8.0G  2.5G  5.5G  31% /
/dev/xvdf       8.0G  1.2G  6.8G  15% /data
```

**Explanation:**
- `df -h` shows the **old size** (8G) because filesystem hasn't been resized yet
- This is normal behavior

---

## Step 3: Identify Filesystem Type

### Check Filesystem Type

```bash
# Check filesystem type
sudo file -s /dev/xvdf
```

**Possible Outputs:**

**If filesystem exists (ext4):**
```
/dev/xvdf: Linux rev 1.0 ext4 filesystem data, UUID=abcd1234-...
```

**If filesystem exists (xfs):**
```
/dev/xvdf: SGI XFS filesystem data
```

**If no filesystem (data disk):**
```
/dev/xvdf: data
```

### Alternative Method

```bash
# Using lsblk to show filesystem type
lsblk -f

# Or using blkid
sudo blkid /dev/xvdf
```

**Example Output:**
```
/dev/xvdf: UUID="abcd1234-5678-90ab-cdef-1234567890ab" TYPE="ext4"
```

---

## Step 4: Resize the Filesystem

### For ext4 Filesystem (Most Common)

```bash
# Resize ext4 filesystem
sudo resize2fs /dev/xvdf
```

**Example Output:**
```
resize2fs 1.45.6 (20-Mar-2020)
Filesystem at /dev/xvdf is mounted on /data; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 3
The filesystem on /dev/xvdf is now 5242880 (4k) blocks long.
```

**Explanation:**
- `resize2fs` expands the ext4 filesystem to fill the entire volume
- Works **online** (no need to unmount)
- Safe and instant operation

### For XFS Filesystem (Amazon Linux 2 Default)

```bash
# Resize XFS filesystem (use mount point, not device)
sudo xfs_growfs /data

# Or using device path
sudo xfs_growfs -d /dev/xvdf
```

**Example Output:**
```
data blocks changed from 2097152 to 5242880
```

**Explanation:**
- `xfs_growfs` is used for XFS filesystems
- Amazon Linux 2 uses XFS by default
- Use the **mount point** (`/data`) not the device (`/dev/xvdf`)

### For Partitioned Volumes (Advanced)

If your volume has partitions (e.g., `/dev/xvdf1`):

```bash
# 1. Install growpart (if not present)
sudo yum install cloud-utils-growpart  # Amazon Linux/RHEL
sudo apt install cloud-guest-utils     # Ubuntu/Debian

# 2. Grow the partition
sudo growpart /dev/xvdf 1

# 3. Resize the filesystem
sudo resize2fs /dev/xvdf1  # For ext4
# Or
sudo xfs_growfs /          # For XFS
```

### If No Filesystem Exists (New Volume)

**⚠️ WARNING**: This will **erase all data** on the volume!

```bash
# Format with ext4
sudo mkfs -t ext4 /dev/xvdf

# Or format with XFS
sudo mkfs -t xfs /dev/xvdf

# Create mount point
sudo mkdir -p /data

# Mount the volume
sudo mount /dev/xvdf /data

# Make it permanent (add to /etc/fstab)
echo "/dev/xvdf /data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
```

---

## Step 5: Verify Changes

### Check Updated Size

```bash
# Check filesystem size
df -h
```

**Example Output (After Resize):**
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/xvda1      8.0G  2.5G  5.5G  31% /
/dev/xvdf       20G   1.2G  18G    7% /data
```

**Success Indicators:**
- Size shows the new value (20G)
- Available space has increased
- Used space remains the same
- No data loss

### Verify with lsblk

```bash
lsblk
```

**Example Output:**
```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
xvda    202:0    0   8G  0 disk 
└─xvda1 202:1    0   8G  0 part /
xvdf    202:80   0  20G  0 disk /data
```

Both `lsblk` and `df -h` should now show the same size.

---

## Troubleshooting

### Issue 1: Volume Still Shows Old Size

**Check modification status:**
```bash
aws ec2 describe-volumes-modifications --volume-id vol-xxxxxxxxx
```

**Wait for optimization:**
- Volume modification might take a few minutes
- Status should be "optimizing" then "completed"

### Issue 2: resize2fs Command Not Found

**Solution:**
```bash
# Amazon Linux/RHEL
sudo yum install e2fsprogs

# Ubuntu/Debian
sudo apt install e2fsprogs
```

### Issue 3: Filesystem Still Old Size After resize2fs

**Check if partition needs resizing:**
```bash
lsblk

# If you see xvdf1 (partition), resize partition first
sudo growpart /dev/xvdf 1
sudo resize2fs /dev/xvdf1
```

### Issue 4: XFS Filesystem Error

```bash
# Wrong command (won't work)
sudo resize2fs /dev/xvdf

# Correct command for XFS
sudo xfs_growfs /data  # Use mount point
```

### Issue 5: Device is Busy

```bash
# Check what's using the volume
sudo lsof /data

# If possible, stop services temporarily
sudo systemctl stop myapp
sudo resize2fs /dev/xvdf
sudo systemctl start myapp
```

### Issue 6: Check Filesystem Errors

```bash
# For ext4 (must unmount first)
sudo umount /data
sudo e2fsck -f /dev/xvdf
sudo mount /data

# For XFS (can run mounted)
sudo xfs_repair /dev/xvdf
```

---

## Important Notes

### 🔴 Critical Points

1. **Always backup data** before resizing operations
2. **Cannot shrink volumes** - AWS EBS only allows increasing size
3. **No downtime required** - resize operations are online
4. **Filesystem type matters** - use correct resize command:
   - `resize2fs` for ext2/ext3/ext4
   - `xfs_growfs` for XFS
5. **Root volume resizing** - may require additional steps

### 📝 Best Practices

- Monitor disk usage regularly: `df -h`
- Set up CloudWatch alarms for disk space
- Plan for future growth (resize before running out of space)
- Test resize procedure in non-production environment first
- Document your filesystem type and mount points

### 🔧 Common Commands Summary

| Task | Command |
|------|---------|
| List volumes | `lsblk` |
| Check usage | `df -h` |
| Check filesystem | `sudo file -s /dev/xvdf` |
| Resize ext4 | `sudo resize2fs /dev/xvdf` |
| Resize XFS | `sudo xfs_growfs /data` |
| Grow partition | `sudo growpart /dev/xvdf 1` |
| Check mount | `mount \| grep xvdf` |

### 🚀 Quick Reference

**Complete Resize Workflow:**

```bash
# 1. Modify volume in AWS Console (8GB → 20GB)

# 2. SSH to instance
ssh -i key.pem ubuntu@instance-ip

# 3. Check current state
lsblk
df -h

# 4. Check filesystem type
sudo file -s /dev/xvdf

# 5. Resize filesystem
sudo resize2fs /dev/xvdf    # For ext4
# OR
sudo xfs_growfs /data       # For XFS

# 6. Verify
df -h
```

### 📊 Filesystem Type Quick Guide

| Filesystem | Resize Command | Online? | Default For |
|------------|----------------|---------|-------------|
| ext4 | `resize2fs /dev/xvdf` | ✅ Yes | Ubuntu, older Linux |
| XFS | `xfs_growfs /mount-point` | ✅ Yes | Amazon Linux 2, RHEL 7+ |
| ext3 | `resize2fs /dev/xvdf` | ✅ Yes | Older systems |
| ext2 | `resize2fs /dev/xvdf` | ❌ No | Very old systems |

---

## Complete Example Walkthrough

### Scenario: Resize 8GB volume to 20GB

**Step-by-step:**

```bash
# Initial state
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/xvdf       8.0G  6.5G  1.5G  82% /data

# 1. Modify in AWS Console (8GB → 20GB)

# 2. Check block device (shows new size)
$ lsblk
NAME    SIZE
xvdf     20G    ← AWS size updated

# 3. Check filesystem (shows old size)
$ df -h
/dev/xvdf  8.0G  6.5G  1.5G  82% /data
           ↑ Still old size

# 4. Check filesystem type
$ sudo file -s /dev/xvdf
/dev/xvdf: Linux rev 1.0 ext4 filesystem
           ↑ ext4 filesystem

# 5. Resize filesystem
$ sudo resize2fs /dev/xvdf
resize2fs 1.45.6 (20-Mar-2020)
Filesystem at /dev/xvdf is mounted on /data
The filesystem on /dev/xvdf is now 5242880 blocks long.

# 6. Verify (shows new size)
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/xvdf        20G  6.5G   13G  34% /data
                 ↑ Now shows 20G!

# Success! Volume resized from 8GB to 20GB with no data loss
```

---


**Remember**: Always backup before resizing! 💾