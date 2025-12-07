# 📦 Install Docker on Fresh Ubuntu EC2 — Step-by-Step Guide

##  1. Update System  
```bash
sudo apt update
sudo apt -y upgrade

# Remove any old docker versions (safe to run)
sudo apt remove -y docker docker-engine docker.io containerd runc || true
```

##  2. Install Required Packages  
```bash
sudo apt install -y ca-certificates curl gnupg lsb-release
```

##  3. Add Docker’s GPG Key  
```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg   | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

##  4. Add Docker Repository  
```bash
echo   "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg]   https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"   | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

##  5. Install Docker Engine  
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

##  6. Start Docker Service  
```bash
sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
```

##  7. Allow Non-root User to Run Docker  
```bash
sudo usermod -aG docker $USER
newgrp docker
```

##  8. Test Docker Installation  
```bash
docker run hello-world
```
