
# Linux User, Password & SSH Authentication Notes (Ubuntu / AWS EC2)

These notes explain **how users, passwords, and SSH login actually work** on Ubuntu servers (especially AWS EC2).  
This is written for **future reference** and safe to push to GitHub.

---

## 1. Creating a New User

Create a user named `azkar`:

```bash
sudo adduser azkar
```

This:
- Creates `/home/azkar`
- Creates group `azkar`
- Asks to set a **password** (used internally, not for SSH by default)

---

## 2. What Is This Password Used For?

🔐 **Password is NOT used for SSH login (by default)**

The password is used only for:
- `su azkar` (switch user)
- `sudo` authentication
- Local/internal user switching
- Console access (if enabled)

Example:

```bash
su azkar
# asks for azkar's password
```

👉 This works **only if you are already logged in** as another user.

---

## 3. Setting or Changing User Password

Set or change password anytime:

```bash
sudo passwd azkar
```

This does **NOT** enable SSH password login automatically.

---

## 4. SSH Login ≠ Password Login (Important Concept)

SSH login works using **keys**, not passwords.

### SSH uses:
- Private key (PEM) → on your local machine
- Public key → stored on server

Password login and SSH login are **completely different systems**.

---

## 5. How Ubuntu User Logs In via PEM

When you do:

```bash
ssh -i key.pem ubuntu@SERVER_IP
```

Ubuntu checks:

```text
/home/ubuntu/.ssh/authorized_keys
```

If your public key exists → login allowed.

---

## 6. Allow `azkar` to Login via SSH (Recommended Way)

### Step 1: Create `.ssh` directory
```bash
sudo mkdir /home/azkar/.ssh
sudo chmod 700 /home/azkar/.ssh
```

---

### Step 2: Copy ubuntu’s authorized keys
(This allows same PEM file)

```bash
sudo cp /home/ubuntu/.ssh/authorized_keys /home/azkar/.ssh/
```

---

### Step 3: Fix ownership & permissions (VERY IMPORTANT)

```bash
sudo chown -R azkar:azkar /home/azkar/.ssh
sudo chmod 600 /home/azkar/.ssh/authorized_keys
```

---

### Step 4: Login as azkar using PEM

```bash
ssh -i key.pem azkar@SERVER_IP
```

✅ Secure  
✅ No password needed  
✅ Best practice

---

## 7. Best Practice (Multiple Developers)

Each user should have **their own SSH key**:

```bash
ssh-keygen
```

Add their `.pub` key to:

```bash
/home/azkar/.ssh/authorized_keys
```

Benefits:
- Easy access removal
- No shared PEM
- Audit-friendly

---

## 8. Enable SSH Password Login (NOT RECOMMENDED)

⚠️ Only for learning or internal testing.

### Step 1: Edit SSH config

```bash
sudo nano /etc/ssh/sshd_config
```

Set:

```ini
PasswordAuthentication yes
PermitRootLogin no
```

---

### Step 2: Restart SSH

```bash
sudo systemctl restart ssh
```

---

### Step 3: Login using password

```bash
ssh azkar@SERVER_IP
```

⚠️ This exposes server to brute-force attacks.

---

## 9. Recommended Secure Setup (Final)

| Feature | Recommendation |
|------|------|
SSH Key Login | ✅ Enabled |
Password SSH Login | ❌ Disabled |
User Password | ✅ Enabled |
Root Login | ❌ Disabled |
Per-user SSH keys | ✅ Yes |

---

## 10. Mental Model (Remember This)

```
SSH Login → authorized_keys → PEM / SSH key
User Password → sudo / su / internal access
```

They are **NOT the same thing**.

---

## 11. Useful Commands

```bash
groups azkar
sudo visudo
sudo passwd azkar
ls -la /home/azkar/.ssh
```

---

## 12. Safe to Push to GitHub

✔ No secrets  
✔ No keys  
✔ Documentation only  

---

### Author Notes
- Tested on Ubuntu (AWS EC2)
- Key-based auth preferred
- Password SSH avoided for security

---
