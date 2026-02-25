# SCP & SFTP Notes (Quick Reference)

## Overview

- **SCP (Secure Copy Protocol)**  
  Used for **quick one-time file or folder copy** over SSH.

- **SFTP (Secure File Transfer Protocol)**  
  Used for **interactive file transfer & management** over SSH.

Both:
- Work over **SSH**
- Use **Port 22**
- Support **password or SSH key (.pem)** authentication

---

## Ports

| Protocol | Port |
|--------|------|
| SSH | 22 |
| SCP | 22 |
| SFTP | 22 |

---

## SCP – File Upload & Download

### Upload file (Local → Server)

Without key:
```bash
scp file.txt user@SERVER_IP:/path/on/server/
```

With PEM key:
```bash
scp -i key.pem file.txt user@SERVER_IP:/path/on/server/
```

### Upload folder (recursive)

```bash
scp -r -i key.pem myfolder/ user@SERVER_IP:/path/on/server/
```

### Upload folder example:

```bash
scp -i "C:\Users\Azkar\Desktop\AWS Connect\CNPL.pem" -r "G:\Ultimate Numerology App\numerology-web\dist" ubuntu@ec2-65-0-19-52.ap-south-1.compute.amazonaws.com:/home/ubuntu/
```

### Download file (Server → Local)

```bash
scp -i key.pem user@SERVER_IP:/path/on/server/file.txt .
```

---

## SFTP – File Upload & Download

### Connect to server

Without key:
```bash
sftp user@SERVER_IP
```

With PEM key:
```bash
sftp -i key.pem user@SERVER_IP
```

---

### Upload file using SFTP

```bash
put file.txt
```

Upload to specific path:
```bash
put file.txt /path/on/server/
```

Upload folder:
```bash
put -r myfolder
```

---

### Download file using SFTP

```bash
get file.txt
```

Download from specific path:
```bash
get /path/on/server/file.txt
```

Download folder:
```bash
get -r myfolder
```

---

## Useful SFTP Commands

```bash
ls        # list files
cd dir    # change remote directory
lcd dir   # change local directory
pwd       # remote path
lpwd      # local path
rm file   # delete file
mkdir d   # create directory
exit      # quit sftp
```

---

## SCP vs SFTP (Quick Comparison)

| Feature | SCP | SFTP |
|------|-----|------|
| One command copy | ✅ | ❌ |
| Interactive session | ❌ | ✅ |
| Browse folders | ❌ | ✅ |
| Resume transfer | ❌ | ✅ |
| File management | ❌ | ✅ |
| Speed | Faster | Slightly slower |

---

## When to Use What

- **Use SCP**  
  - Quick upload/download  
  - CI/CD scripts  
  - One-time file copy

- **Use SFTP**  
  - Daily file handling  
  - Multiple uploads/downloads  
  - GUI tools (FileZilla / WinSCP)

---

## One-Line Summary

> SCP = quick secure copy  
> SFTP = secure file management

---

**Ready to store in GitHub for future reference.**
