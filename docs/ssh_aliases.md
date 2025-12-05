# SSH Aliases Setup on Windows

## Overview

SSH aliases allow you to connect to remote servers using simple, memorable names instead of typing long hostnames, usernames, and key file paths every time. This guide shows how to set up SSH aliases on Windows for quick and easy server access.

---

## 1. Create SSH Config File

### Location

The SSH config file should be located at:

```
C:/Users/<YourUsername>/.ssh/config
```

### Steps to Create

1. Navigate to your user directory: `C:/Users/<YourUsername>/`
2. Create a folder named `.ssh` if it doesn't exist
3. Inside `.ssh`, create a file named **`config`** (no file extension)

**Important**: The file must be named exactly `config` with no extension (not `config.txt`)

---

## 2. Add Aliases for EC2 Instances

### Configuration Syntax

Open the `config` file and add your server aliases using the following format:

```ssh-config
Host <alias-name>
    HostName <server-address>
    User <username>
    IdentityFile "<path-to-pem-file>"
```

### Example Configuration

```ssh-config
# Main Production Server
Host main
    HostName ec2-43-204-76-78.ap-south-1.compute.amazonaws.com
    User ubuntu
    IdentityFile "C:/Users/Azkar/Desktop/AWS Connect/Chaardham.pem"

# Test/Staging Server
Host test
    HostName ec2-35-154-175-112.ap-south-1.compute.amazonaws.com
    User ubuntu
    IdentityFile "C:/Users/Azkar/Desktop/AWS Connect/Chaardham.pem"
```

### Connecting with Aliases

Once configured, you can connect using simple commands:

```bash
# Connect to main server
ssh main

# Connect to test server
ssh test
```

**Before aliases:**
```bash
ssh -i "C:/Users/Azkar/Desktop/AWS Connect/Chaardham.pem" ubuntu@ec2-43-204-76-78.ap-south-1.compute.amazonaws.com
```

**After aliases:**
```bash
ssh main
```

Much cleaner and faster! 🚀

---

## 3. Using SSH Aliases in VS Code

VS Code automatically detects SSH aliases from your `config` file, making it easy to connect to remote servers directly from the editor.

### Steps to Connect

1. **Open VS Code**
2. **Press F1** (or `Ctrl+Shift+P`) to open Command Palette
3. **Type**: `Remote-SSH: Connect to Host`
4. **Select** from the list:
   - `main`
   - `test`
5. **Click** on the alias to connect

VS Code will automatically use the hostname, user, and identity file from your config.

### Benefits

- No need to manually enter connection details
- Quick switching between servers
- Integrated terminal with remote access
- Edit remote files directly in VS Code

---

## 4. Secure PEM File Permissions (Optional but Recommended)

Windows sometimes requires strict permissions on PEM/private key files for SSH to work properly. If you encounter permission errors, follow these steps.

### Fix Permissions Using PowerShell

Run the following commands in **PowerShell** (as Administrator):

```powershell
# Remove inherited permissions
icacls "C:\Users\Azkar\Desktop\AWS Connect\Chaardham.pem" /inheritance:r

# Grant read-only access to current user
icacls "C:\Users\Azkar\Desktop\AWS Connect\Chaardham.pem" /grant:r "%USERNAME%:(R)"
```

### What These Commands Do

- **`/inheritance:r`** - Removes all inherited permissions (makes it private)
- **`/grant:r`** - Grants read-only access to your Windows user account

### Verify Permissions

Right-click the PEM file → Properties → Security tab
- Only your username should be listed with Read permissions

---

## 5. Advanced Configuration Options

### Adding Port Number

```ssh-config
Host custom-port
    HostName example.com
    User ubuntu
    Port 2222
    IdentityFile "C:/path/to/key.pem"
```

### Adding Multiple Keys

```ssh-config
Host server1
    HostName server1.example.com
    User admin
    IdentityFile "C:/keys/server1.pem"

Host server2
    HostName server2.example.com
    User root
    IdentityFile "C:/keys/server2.pem"
```

### Connection Timeout

```ssh-config
Host slow-server
    HostName slow.example.com
    User ubuntu
    IdentityFile "C:/keys/key.pem"
    ConnectTimeout 30
```

### Keep Alive Settings

Prevent SSH connection from timing out:

```ssh-config
Host keep-alive
    HostName example.com
    User ubuntu
    IdentityFile "C:/keys/key.pem"
    ServerAliveInterval 60
    ServerAliveCountMax 3
```

### Proxy Jump (Bastion Host)

Connect through a jump server:

```ssh-config
Host bastion
    HostName bastion.example.com
    User ubuntu
    IdentityFile "C:/keys/bastion.pem"

Host internal-server
    HostName 10.0.1.50
    User ubuntu
    IdentityFile "C:/keys/internal.pem"
    ProxyJump bastion
```

---

## 6. Common SSH Config Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `Host` | Alias name | `Host myserver` |
| `HostName` | Actual server address | `HostName example.com` |
| `User` | SSH username | `User ubuntu` |
| `IdentityFile` | Path to private key | `IdentityFile "C:/keys/key.pem"` |
| `Port` | SSH port (default: 22) | `Port 2222` |
| `ConnectTimeout` | Connection timeout in seconds | `ConnectTimeout 30` |
| `ServerAliveInterval` | Keep-alive interval | `ServerAliveInterval 60` |
| `ProxyJump` | Jump host | `ProxyJump bastion` |
| `ForwardAgent` | Enable SSH agent forwarding | `ForwardAgent yes` |
| `StrictHostKeyChecking` | Host key checking | `StrictHostKeyChecking no` |

---

## 7. Troubleshooting

### Issue 1: Permission Denied (PEM File)

**Error:**
```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for 'key.pem' are too open.
```

**Solution:**
Run the permission fix commands from Section 4.

### Issue 2: Config File Not Working

**Possible Causes:**
- File extension (should be `config`, not `config.txt`)
- Wrong location (must be in `~/.ssh/`)
- Syntax errors in config file

**Solution:**
```bash
# Check config file location
ls C:/Users/<YourUsername>/.ssh/config

# Test SSH with verbose mode
ssh -v main
```

### Issue 3: VS Code Not Detecting Aliases

**Solution:**
1. Reload VS Code
2. Check config file syntax
3. Ensure Remote-SSH extension is installed
4. Press F1 → `Remote-SSH: Kill VS Code Server on Host`

### Issue 4: Connection Timeout

**Solution:**
Add timeout settings to config:

```ssh-config
Host myserver
    HostName example.com
    User ubuntu
    IdentityFile "C:/keys/key.pem"
    ConnectTimeout 60
    ServerAliveInterval 30
```

---

## 8. Summary

### Quick Setup Checklist

- ✅ Create `.ssh/config` file at `C:/Users/<YourUsername>/.ssh/config`
- ✅ Add aliases using `Host` directive
- ✅ Include `HostName`, `User`, and `IdentityFile` for each alias
- ✅ Use `ssh <alias>` to connect from terminal
- ✅ VS Code automatically detects aliases (no extra setup needed)
- ✅ Secure PEM file permissions if encountering errors
- ✅ Test connections with `ssh -v <alias>` for debugging

### Benefits

- 🚀 **Speed**: Connect instantly with short commands
- 🎯 **Simplicity**: No need to remember IP addresses or paths
- 🔄 **Consistency**: Same aliases work in terminal and VS Code
- 🔒 **Security**: Centralized key management
- 📝 **Maintainability**: Easy to update and organize servers

### Example Usage

```bash
# Before
ssh -i "C:/Users/Azkar/Desktop/AWS Connect/Chaardham.pem" ubuntu@ec2-43-204-76-78.ap-south-1.compute.amazonaws.com

# After
ssh main
```

This makes managing and switching between multiple servers super fast and clean! 🎉