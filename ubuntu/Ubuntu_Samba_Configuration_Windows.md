
# Samba Configuration: Ubuntu ↔ Windows

This document explains **what Samba is**, **how it works**, and **how to configure Samba on Ubuntu** so it can be accessed from **Windows** systems.  
It is written as clean documentation suitable for **GitHub notes**.

---

## 1. What is Samba?

**Samba** allows Linux systems to share files and folders with Windows systems using the **SMB/CIFS protocol** (the same protocol Windows uses for network sharing).

In simple words:

> Samba = Windows-style file sharing for Linux

---

## 2. Important Concepts (Must Read)

- Samba does **NOT** use SSH
- Samba does **NOT** use Linux login passwords
- Samba has its **own authentication**
- Linux user ≠ Samba user (but they can be linked)

---

## 3. Install Samba on Ubuntu

### Install Samba server
```bash
sudo apt update
sudo apt install samba -y
```

Check status:
```bash
systemctl status smbd
```

---

### Install Samba client (optional but recommended)
```bash
sudo apt install smbclient -y
```

---

## 4. Create a Directory to Share

```bash
sudo mkdir -p /srv/samba/shared
sudo chown -R azkar:azkar /srv/samba/shared
sudo chmod 770 /srv/samba/shared
```

---

## 5. Configure Samba

Edit Samba configuration file:

```bash
sudo nano /etc/samba/smb.conf
```

Scroll to the **very bottom** and add:

```ini
[shared]
   path = /srv/samba/shared
   browseable = yes
   writable = yes
   read only = no
   valid users = azkar
```

---

## 6. Create Samba User Password

⚠️ This is NOT the Linux password.

```bash
sudo smbpasswd -a azkar
sudo smbpasswd -e azkar
```

---

## 7. Validate Samba Configuration

Always validate config before restart:

```bash
testparm
```

Expected output:
```
Loaded services file OK.
```

---

## 8. Restart Samba Services

```bash
sudo systemctl restart smbd
sudo systemctl restart nmbd
```

---

## 9. Test Samba Share on Ubuntu

```bash
smbclient -L localhost -U azkar
```

Expected output:
```
Sharename   Type
---------   ----
shared      Disk
print$      Disk
IPC$        IPC
```

### Note:
```
SMB1 disabled -- no workgroup available
```
This is **NOT an error**. SMB1 is deprecated and disabled for security reasons.

---

## 10. Access Samba Share from Windows

### Method 1: File Explorer

Open **File Explorer** and enter:

```
\\UBUNTU-IP\shared
```

Enter:
- Username: `azkar`
- Password: Samba password

---

### Method 2: Map Network Drive (Recommended)

1. This PC → Map Network Drive
2. Folder:
   ```
   \\UBUNTU-IP\shared
   ```
3. Enable **Reconnect at sign-in**
4. Enter credentials

---

## 11. Firewall Configuration (If UFW Enabled)

```bash
sudo ufw allow samba
```

Ports used:
- TCP 445
- TCP 139

---

## 12. Common Problems & Fixes

### Only IPC$ and print$ visible
- Share block not loaded
- Config typo
- Samba not restarted

Fix:
```bash
testparm
sudo systemctl restart smbd
```

---

### Permission denied from Windows
```bash
sudo chown -R azkar:azkar /srv/samba/shared
sudo chmod 770 /srv/samba/shared
```

---

## 13. Security Best Practices

- Do NOT expose Samba to public internet
- Use Samba only in LAN or VPN
- Use strong Samba passwords
- Restrict users per share

---

## 14. Mental Model

```
SSH    → terminal access
Samba → file sharing
FTP   → file transfer
```

Different tools, different purposes.

---

## 15. Safe for GitHub

✔ No credentials  
✔ No keys  
✔ Documentation only  

---

### Notes
- Tested on Ubuntu (AWS EC2 & local)
- SMB2/SMB3 enabled by default
- SMB1 intentionally disabled

---
