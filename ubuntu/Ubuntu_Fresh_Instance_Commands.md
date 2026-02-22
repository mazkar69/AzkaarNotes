# Fresh Ubuntu Instance Setup Commands

This guide provides all essential commands to run on a brand-new Ubuntu server instance.  
Perfect for AWS EC2, VPS, or local fresh installations.

---

##  1. Update Package Index

```bash
sudo apt update
```

---

##  2. Upgrade Installed Packages

```bash
sudo apt upgrade -y
```

---

##  3. Full Upgrade (Recommended)

```bash
sudo apt full-upgrade -y
```

---

##  4. Remove Old & Unused Packages

```bash
sudo apt autoremove -y
sudo apt autoclean
```

---

##  5. Install Essential Tools

```bash
sudo apt install -y curl wget git ufw unzip htop
```

### Why These Tools?
- **curl** → API calls & script downloads  
- **wget** → file downloads  
- **git** → deploy & version control  
- **ufw** → firewall  
- **unzip** → extract ZIP files  
- **htop** → system monitoring  

---

##  6. Setup Firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw enable
```

### If Using Nginx

```bash
sudo ufw allow 'Nginx Full'
```

---

##  7. Optional: Install Nginx Web Server

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

#  TL;DR — Essential Commands

```bash
sudo apt update
sudo apt upgrade -y
sudo apt full-upgrade -y
sudo apt autoremove -y
sudo apt autoclean
sudo apt install -y curl wget git ufw unzip htop
sudo ufw allow OpenSSH
sudo ufw enable
```

### For Web Hosting:

```bash
sudo apt install nginx -y
```

---

Happy Deploying! 🚀
