# SSH Key Generation Guide

> Passwordless authentication using SSH keys — Secure remote server access

<br>

## 📋 Table of Contents

- [How SSH Keys Work](#how-ssh-keys-work)
- [Key Types: ED25519 vs RSA](#key-types-ed25519-vs-rsa)
- [Generate SSH Keys (ED25519 - Recommended)](#generate-ssh-keys-ed25519---recommended)
- [Generate SSH Keys (RSA - Legacy)](#generate-ssh-keys-rsa---legacy)
- [Understanding the Output](#understanding-the-output)
- [View Your Public Key](#view-your-public-key)
- [Copy Public Key to Server](#copy-public-key-to-server)
- [Best Practices](#best-practices)

<br>

---

<br>

## How SSH Keys Work

SSH uses **public-key cryptography** for passwordless authentication. Think of it like this:

```
Public Key  = Lock 🔒  (place on server)
Private Key = Key 🗝️   (keep on your computer)
```

### The Process

1. **Generate key pair** on your local machine (creates 2 files)
2. **Public key** goes to the server's `~/.ssh/authorized_keys`
3. **Private key** stays on your computer (NEVER share this)
4. When connecting, SSH uses your private key to prove identity
5. Server verifies using the matching public key

> **Security:** Even if someone gets your public key, they cannot log in without your private key.

<br>

## Key Types: ED25519 vs RSA

| Feature | ED25519 | RSA |
|---------|---------|-----|
| **Security** | ✅ More secure | ⚠️ Secure (with 4096 bits) |
| **Speed** | ✅ Faster | Slower |
| **Key Size** | Smaller | Larger |
| **Modern Standard** | ✅ Yes | Legacy |
| **Compatibility** | Most systems (2014+) | All systems |

**Recommendation:** Use **ED25519** unless you need to support very old systems.

<br>

## Generate SSH Keys (ED25519 - Recommended)

### Windows (PowerShell / Git Bash)

```bash
ssh-keygen -t ed25519 -C "azkar@laptop"
```

### Linux / macOS (Terminal)

```bash
ssh-keygen -t ed25519 -C "azkar@laptop"
```

### Parameters Explained

- `-t ed25519` — Key type (ED25519 algorithm)
- `-C "azkar@laptop"` — Comment to identify the key (optional)

### Interactive Prompts

```
Enter file in which to save the key (/c/Users/YourName/.ssh/id_ed25519):
```
**Press Enter** to use default location, or specify custom path like `mykey`

```
Enter passphrase (empty for no passphrase):
```
**Press Enter** for no passphrase, or type a passphrase for extra security

### Output Files

```
id_ed25519      → Private key (keep secret!)
id_ed25519.pub  → Public key (share this)
```

<br>

## Generate SSH Keys (RSA - Legacy)

Use this if you need compatibility with older systems.

### Windows (PowerShell / Git Bash)

```bash
ssh-keygen -t rsa -b 4096 -C "azkar@laptop"
```

### Linux / macOS (Terminal)

```bash
ssh-keygen -t rsa -b 4096 -C "azkar@laptop"
```

### Parameters Explained

- `-t rsa` — Key type (RSA algorithm)
- `-b 4096` — Key size in bits (4096 is secure, 2048 minimum)
- `-C "azkar@laptop"` — Comment to identify the key

### Output Files

```
id_rsa      → Private key (keep secret!)
id_rsa.pub  → Public key (share this)
```

<br>

## Understanding the Output

After generating keys, you'll see output like:

```
Your identification has been saved in /c/Users/YourName/.ssh/id_ed25519
Your public key has been saved in /c/Users/YourName/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:ABC123xyz... azkar@laptop
```

**Key files location:**
- **Windows:** `C:\Users\YourName\.ssh\`
- **Linux/macOS:** `~/.ssh/`

<br>

## View Your Public Key

### Windows (PowerShell)

```powershell
Get-Content ~/.ssh/id_ed25519.pub
```

### Windows (Git Bash) / Linux / macOS

```bash
cat ~/.ssh/id_ed25519.pub
```

### Public Key Format

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbc123xyz... azkar@laptop
```

This entire line is your public key — copy it completely including the comment at the end.

<br>

## Copy Public Key to Server

### Method 1: Manual Copy (Works on all systems)

**Step 1 — Copy public key to clipboard**

```powershell
# Windows PowerShell
Get-Content ~/.ssh/id_ed25519.pub | clip

# Linux (with xclip)
cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard

# macOS
cat ~/.ssh/id_ed25519.pub | pbcopy
```

**Step 2 — SSH into server**

```bash
ssh username@server_ip
```

**Step 3 — Create .ssh directory (if it doesn't exist)**

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

**Step 4 — Paste public key**

```bash
nano ~/.ssh/authorized_keys
# Paste the public key, save and exit (Ctrl+X → Y → Enter)
```

**Step 5 — Set permissions**

```bash
chmod 600 ~/.ssh/authorized_keys
```

### Method 2: Using ssh-copy-id (Linux / macOS / Git Bash)

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub username@server_ip
```

This automatically copies your public key to the server's `authorized_keys` file.

<br>


<br>

## Best Practices

### ✅ Do's

| Practice | Description |
|----------|-------------|
| **Use ED25519** | Modern, secure, and fast |
| **Use passphrases** | Adds extra security layer (optional but recommended) |
| **Keep private keys safe** | Never share, never upload to cloud/GitHub |
| **Use different keys** | Different key for each server/service (optional) |
| **Set correct permissions** | `700` for `.ssh/`, `600` for private keys |
| **Backup keys** | Store encrypted backup of private keys |

### ❌ Don'ts

| Practice | Why Avoid |
|----------|-----------|
| **Share private keys** | Anyone with private key can access your servers |
| **Commit to Git** | Private keys should never be in version control |
| **Use weak RSA keys** | Always use 4096 bits minimum for RSA |
| **Skip permissions** | Wrong permissions = SSH refuses to work |
| **Reuse same key everywhere** | If compromised, all servers at risk |

<br>

---

### Quick Command Reference

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Generate RSA key (legacy)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# View public key
cat ~/.ssh/id_ed25519.pub

# Copy to server (manual)
cat ~/.ssh/id_ed25519.pub | ssh user@host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# Copy to server (auto)
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host

# Connect with specific key
ssh -i ~/.ssh/mykey user@host

# Test connection
ssh -T git@github.com  # for GitHub
```

<br>

---

> 🔒 Never share your private key — Keep it secure — Use strong passphrases