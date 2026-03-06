# Linux User, Password & SSH Authentication Notes

> **Ubuntu / AWS EC2** — Understanding users, passwords, and SSH key authentication

<br>

## 📋 Table of Contents

- [1. Creating a New User](#1-creating-a-new-user)
- [2. What Is This Password Used For?](#2-what-is-this-password-used-for)
- [3. Setting or Changing User Password](#3-setting-or-changing-user-password)
- [4. SSH Login vs Password Login](#4-ssh-login-vs-password-login-important-concept)
- [5. Method 1 — Use Existing AWS PEM File](#5-method-1--use-existing-aws-pem-file)
- [6. Method 2 — Create Your Own SSH Key Pair](#6-method-2--create-your-own-ssh-key-pair)
- [7. Important Notes About SSH Keys](#7-important-notes-about-ssh-keys)
- [8. What If You Lost the PEM File?](#8-what-if-you-lost-the-pem-file)
- [9. Enable SSH Password Login (NOT RECOMMENDED)](#9-enable-ssh-password-login-not-recommended)
- [10. Recommended Secure Setup](#10-recommended-secure-setup)
- [11. Mental Model](#11-mental-model)
- [12. Useful Commands](#12-useful-commands)

<br>

---

<br>

## 1. Creating a New User

Create a user named `azkar`:

```bash
sudo adduser azkar
```

**What this does:**
- Creates `/home/azkar` directory
- Creates group `azkar`
- Asks to set a **password** (used internally, not for SSH by default)

<br>

## 2. What Is This Password Used For?

> **⚠️ Important:** Password is NOT used for SSH login (by default)

The password is used only for:
- `su azkar` — switch user
- `sudo` — privilege escalation
- Local/internal user switching
- Console access (if enabled)

**Example:**
```bash
su azkar
# asks for azkar's password
```

This works **only if you are already logged in** as another user.

<br>

## 3. Setting or Changing User Password

```bash
sudo passwd azkar
```

> **Note:** This does NOT enable SSH password login automatically.

<br>

## 4. SSH Login vs Password Login (Important Concept)

SSH login works using **key pairs**, not passwords. These are two completely separate systems.

| System | Uses |
|--------|------|
| **SSH Login** | Private key (local) + Public key (server) |
| **Password Login** | User password for `sudo` / `su` / console |

<br>

## 5. Method 1 — Use Existing AWS PEM File

When AWS creates an EC2 instance it gives you a `.pem` file. You can reuse that same PEM to allow another user (e.g. `azkar`) to log in.

### How it works

When you run:
```bash
ssh -i key.pem ubuntu@SERVER_IP
```

Ubuntu checks `/home/ubuntu/.ssh/authorized_keys` — if your public key is listed, login is allowed.

### Implementation Steps

**Step 1 — Create `.ssh` directory for the user**
```bash
sudo mkdir /home/azkar/.ssh
```

**Step 2 — Copy ubuntu's authorized_keys (reuse same PEM)**
```bash
sudo cp /home/ubuntu/.ssh/authorized_keys /home/azkar/.ssh/
```

**Step 3 — Fix ownership and permissions**
```bash
sudo chown -R azkar:azkar /home/azkar/.ssh
sudo chmod 700 /home/azkar/.ssh
sudo chmod 600 /home/azkar/.ssh/authorized_keys
```

**Step 4 — Login as azkar using the PEM file**
```bash
ssh -i key.pem azkar@SERVER_IP
```

<br>

## 6. Method 2 — Create Your Own SSH Key Pair

Use this when you want to generate a fresh key independent of the AWS PEM file.

### Implementation Steps

**Step 1 — Generate SSH key on Windows (local machine)**

Open **PowerShell** or **Git Bash** and run:
```bash
ssh-keygen -t ed25519 -f mykey
```

This creates two files:
- `mykey` — private key (keep this safe, never share)
- `mykey.pub` — public key (this goes on the server)

**Step 2 — Copy the public key text**
```powershell
Get-Content mykey.pub
```

Copy the entire output — it looks like:
```
ssh-ed25519 AAAAC3Nz... your_comment
```

**Step 3 — On the server, go to the user's `.ssh` directory**

Login to the server (as `root`, `ubuntu`, or any sudo user) and navigate to the target user's SSH folder:
```bash
cd /home/azkar/.ssh
```

If the `.ssh` folder does not exist, create it first:
```bash
sudo mkdir /home/azkar/.ssh
```

**Step 4 — Create `authorized_keys` and paste the public key**
```bash
sudo nano /home/azkar/.ssh/authorized_keys
```

Paste the public key text you copied in Step 2, save and exit (`Ctrl+X` → `Y` → `Enter`).

**Step 5 — Set correct permissions**
```bash
sudo chown -R azkar:azkar /home/azkar/.ssh
chmod 700 /home/azkar/.ssh
chmod 600 /home/azkar/.ssh/authorized_keys
```

**Step 6 — Connect from Windows**
```bash
ssh -i mykey azkar@SERVER_IP
```

<br>

## 7. Important Notes About SSH Keys

### Multiple keys in `authorized_keys`

You can add **as many public keys as you want** to the `authorized_keys` file — one key per line. Each person with the matching private key can log in independently.

```
ssh-ed25519 AAAA... developer-1
ssh-ed25519 BBBB... developer-2
ssh-rsa    CCCC... old-key
```

### Giving server access to a team member

**1. Create a user for them on the server:**
```bash
sudo adduser john
```

**2. Ask them to generate their own SSH key** and send you their **public key** (`id_ed25519.pub` or similar).

**3. Create their `.ssh` folder and paste their public key:**
```bash
sudo mkdir /home/john/.ssh
sudo nano /home/john/.ssh/authorized_keys
# paste their public key, save
sudo chown -R john:john /home/john/.ssh
sudo chmod 700 /home/john/.ssh
sudo chmod 600 /home/john/.ssh/authorized_keys
```

**4. They connect using their own private key:**
```bash
ssh -i their_private_key john@SERVER_IP
```

> **Revoke access:** Delete their line from `authorized_keys`.

<br>

## 8. What If You Lost the PEM File?

If you lose the PEM file you can no longer SSH through the normal route. Here is how to recover access:

### Recovery Steps

**Step 1 — Access the server via AWS Console**

Use one of these options to get a shell session without SSH:
- **EC2 Instance Connect** — AWS Console → Instance → Connect
- **AWS Session Manager** — if SSM agent is installed
- Detach root volume, mount to another instance, edit `authorized_keys`

**Step 2 — Generate a new SSH key on your local machine**
```bash
ssh-keygen -t ed25519 -f id_ed25519
```

Copy the public key:
```powershell
# Windows PowerShell
Get-Content id_ed25519.pub
```

**Step 3 — Paste the public key on the server**

Inside the console session, append the new public key:
```bash
echo "ssh-ed25519 AAAA... your_comment" >> /home/ubuntu/.ssh/authorized_keys
```

Or open the file and paste manually:
```bash
nano /home/ubuntu/.ssh/authorized_keys
```

**Step 4 — Connect from Windows without the PEM**
```bash
ssh -i id_ed25519 ubuntu@SERVER_IP
```

### Quick Reference

| Scenario | Command |
|----------|---------|
| With AWS PEM file | `ssh -i mykey.pem ubuntu@SERVER_IP` |
| With your own generated key | `ssh -i id_ed25519 ubuntu@SERVER_IP` |

<br>

## 9. Enable SSH Password Login (NOT RECOMMENDED)

> **⚠️ Warning:** Only for learning or internal testing — exposes server to brute-force attacks.

**Step 1 — Edit SSH config**
```bash
sudo nano /etc/ssh/sshd_config
```

Set:
```ini
PasswordAuthentication yes
PermitRootLogin no
```

**Step 2 — Restart SSH**
```bash
sudo systemctl restart ssh
```

**Step 3 — Login using password**
```bash
ssh azkar@SERVER_IP
```

<br>

## 10. Recommended Secure Setup

| Feature | Recommendation |
|---------|----------------|
| SSH Key Login | ✅ Enabled |
| Password SSH Login | ❌ Disabled |
| User Password | ✅ Set (for sudo/su) |
| Root Login via SSH | ❌ Disabled |
| Per-user SSH keys | ✅ Yes |

<br>

## 11. Mental Model

```
SSH Login      →  authorized_keys  →  private key (PEM or generated)
User Password  →  sudo / su / console access
```

> **Key Takeaway:** These are NOT the same thing. You can have one without the other.

<br>

## 12. Useful Commands

```bash
# List user groups
groups azkar

# Change user password
sudo passwd azkar

# Check .ssh folder permissions
ls -la /home/azkar/.ssh

# View authorized keys
cat /home/azkar/.ssh/authorized_keys

# Edit sudoers file
sudo visudo
```

<br>

---

> 🔒 No secrets — No keys — Documentation only — Safe to push to GitHub
