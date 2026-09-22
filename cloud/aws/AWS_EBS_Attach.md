
# 📘 AWS EC2 — EBS Volume Attach/Detach Quick Notes

A clean, production-ready guide for attaching, mounting, detaching, and remounting EBS volumes on Amazon EC2.  
Perfect for DevOps workflows and GitHub documentation.

> ⚠️ **Note on device names:** This guide uses `/dev/xvdf` as the example device.  
> The actual device name **can vary from system to system** (e.g., Nitro-based instances show NVMe names like `/dev/nvme1n1`).  
> Always confirm the correct device with `lsblk` and **update the commands accordingly**.

---

## 🔹 1. Create an EBS Volume
1. Go to **AWS Console → EC2 Dashboard**  
2. Left menu → **Elastic Block Store → Volumes**  
3. Click **Create Volume**  
4. Choose:
   - **Size** (e.g., 20GB)  
   - **Availability Zone** = same as EC2 instance  
   - **Volume Type** = gp3 / gp2  
5. Create Volume

---

## 🔹 2. Attach Volume to EC2
1. EC2 → **Volumes**  
2. Select your volume  
3. **Actions → Attach Volume**  
4. Select instance  
5. Example device name:
```
/dev/xvdf
```

---

## 🔹 3. SSH into EC2
```bash
ssh -i key.pem ubuntu@YOUR_PUBLIC_IP
```

---

## 🔹 4. Check the Attached Disk
```bash
lsblk
```

Expected output:
```
xvda   40G (root volume)
xvdf   20G (new EBS volume)
```

---

## 🔹 5. Format the Volume (One-time only)
```bash
sudo mkfs -t ext4 /dev/xvdf
```

---

## 🔹 6. Create Mount Directory
```bash
sudo mkdir -p /data
```

---

## 🔹 7. Mount the Volume
```bash
sudo mount /dev/xvdf /data
```

---

## 🔹 8. Verify the Mount (Recommended)

After a successful mount, confirm the volume is actually mounted at `/data`.

### Using `findmnt`
```bash
findmnt /data
```

Example output:
```
TARGET SOURCE        FSTYPE OPTIONS
/data  /dev/nvme1n1  ext4   rw,relatime
```

### Using `df -h`
```bash
df -h /data
```

Example output (also shows the available size):
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme1n1     98G  1.3G   92G   2% /data
```

✔ If a line shows `/data` as the **Mounted on** target, the volume is mounted correctly.

---

## 🔹 9. Test File Creation
```bash
ls /data
echo "hello" > /data/test.txt
```

---

## 🔹 10. Configure Auto-Mount on Reboot (fstab)

### Get UUID
```bash
sudo blkid /dev/xvdf
```

Example output:
```
UUID="a1b2c3d4-5678"
```

### Edit `/etc/fstab`
```bash
sudo nano /etc/fstab
```

Add:
```
UUID=a1b2c3d4-5678 /data ext4 defaults,nofail 0 2
```

### Test
```bash
sudo mount -a
```

---

## 🔹 11. Unmount the Volume (Detach from OS)
```bash
sudo umount /data
```

If device is busy:
```bash
sudo umount -l /data
```

---

## 🔹 12. Detach from AWS Console
Go to:  
**EC2 → Volumes → Select Your Volume → Actions → Detach Volume**

---

## 🔹 13. Reattach & Remount to Verify Persistence

### Reattach via Console  
(Same as Step 2)

### Mount again
```bash
sudo mount /dev/xvdf /data
```

### Verify your file
```bash
ls /data
```

If the file still exists →  
✔ **Your EBS volume data is persistent.**

---

## 🔹 Useful Commands Summary

| Purpose | Command |
|--------|---------|
| List block devices | `lsblk` |
| List disk usage | `df -h` |
| Check mount point | `findmnt /data` |
| Check mount + size | `df -h /data` |
| Format new volume | `sudo mkfs -t ext4 /dev/xvdf` |
| Create mount directory | `sudo mkdir -p /data` |
| Mount volume | `sudo mount /dev/xvdf /data` |
| Unmount | `sudo umount /data` |
| Force unmount | `sudo umount -l /data` |
| Check UUID | `sudo blkid` |
| Load fstab | `sudo mount -a` |

---

## 🟢 Data Safety Notes
- Detaching volume **does NOT delete data**  
- Stopping EC2 instance **does NOT delete data**  
- Terminating EC2 deletes **only root volume**  
- Extra EBS volumes stay safe unless manually deleted  

---

## ⭐ Author  
[me] - DevOps Engineer | Cloud Enthusiast