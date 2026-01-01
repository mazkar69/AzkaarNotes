# PM2 - Node.js Process Manager for Production

## Table of Contents
1. [What is PM2?](#what-is-pm2)
2. [Installation](#installation)
3. [Basic Commands](#basic-commands)
4. [Process Management](#process-management)
5. [Auto Startup on Server Reboot](#auto-startup-on-server-reboot)
6. [Cluster Mode](#cluster-mode)
7. [Logs Management](#logs-management)
8. [Ecosystem File](#ecosystem-file)

---

## What is PM2?

PM2 is a **production-ready process manager** for Node.js applications. It keeps your application running forever, reloads without downtime, and helps manage application logs.

### Key Features
- **Process Management**: Start, stop, restart, delete applications
- **Auto Restart**: Automatically restarts crashed applications
- **Load Balancing**: Built-in cluster mode for scaling across CPU cores
- **Startup Script**: Auto-start applications on server reboot
- **Log Management**: Centralized log management with rotation
- **Monitoring**: Real-time monitoring of CPU/Memory usage

### How PM2 Works
```
┌─────────────────────────────────────────────────────────┐
│                      PM2 Daemon                         │
│  (Background process that manages all your apps)        │
├─────────────────────────────────────────────────────────┤
│  App 1 (online)  │  App 2 (online)  │  App 3 (stopped)  │
│  - Monitors      │  - Monitors      │                   │
│  - Auto-restart  │  - Auto-restart  │                   │
│  - Logs          │  - Logs          │                   │
└─────────────────────────────────────────────────────────┘
```

---

## Installation

### Install PM2 Globally
```sh
sudo npm install -g pm2@latest
```

### Verify Installation
```sh
pm2 --version
```

### Update PM2
```sh
sudo npm install -g pm2@latest
pm2 update
```

---

## Basic Commands

### Start an Application
```sh
Syntax:- pm2 start <file>
Example:- pm2 start app.js
```

### Start with Custom Name
```sh
Syntax:- pm2 start <file> --name "<app-name>"
Example:- pm2 start app.js --name "my-api"
```

### List All Running Processes
```sh
pm2 list
# OR
pm2 ls
# OR
pm2 status
```

### Show Detailed Process Info
```sh
Syntax:- pm2 show <app-name-or-id>
Example:- pm2 show my-api
Example:- pm2 show 0
```

---

## Process Management

### Stop Application
```sh
Syntax:- pm2 stop <app-name-or-id>
Example:- pm2 stop my-api
Example:- pm2 stop 0
```

### Stop All Applications
```sh
pm2 stop all
```

### Restart Application
```sh
Syntax:- pm2 restart <app-name-or-id>
Example:- pm2 restart my-api
```

### Restart All Applications
```sh
pm2 restart all
```

### Reload Application (Zero Downtime)
```sh
Syntax:- pm2 reload <app-name-or-id>
Example:- pm2 reload my-api
```

### Delete/Remove Application from PM2
```sh
Syntax:- pm2 delete <app-name-or-id>
Example:- pm2 delete my-api
```

### Delete All Applications
```sh
pm2 delete all
```

### Monitor All Processes (Real-time Dashboard)
```sh
pm2 monit
```

---

## Auto Startup on Server Reboot

This is critical for production - ensures your apps start automatically when server reboots.

### Step 1: Generate Startup Script
```sh
pm2 startup
```
This will output a command like:
```sh
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```
**Copy and run the generated command.**

### Step 2: Save Current Process List
After starting all your applications, save them:
```sh
pm2 save
```
This saves the current process list to `~/.pm2/dump.pm2`

### Step 3: Verify Startup is Configured
```sh
systemctl status pm2-ubuntu
# OR for root user
systemctl status pm2-root
```

### Restore Saved Processes Manually
```sh
pm2 resurrect
```

### Remove Startup Script
```sh
pm2 unstartup systemd
```

### Complete Workflow Example
```sh
# 1. Start your applications
pm2 start app.js --name "api-server"
pm2 start worker.js --name "background-worker"

# 2. Generate startup script (run the output command)
pm2 startup

# 3. Save the process list
pm2 save

# Now your apps will auto-start on server reboot!
```

---

## Cluster Mode

Cluster mode allows you to run multiple instances of your application across all CPU cores for **load balancing** and **improved performance**.

### How Cluster Mode Works
```
┌─────────────────────────────────────────────────────────┐
│                    PM2 Cluster Mode                     │
├─────────────────────────────────────────────────────────┤
│  Master Process (PM2)                                   │
│     ├── Worker 0 (CPU Core 0)                          │
│     ├── Worker 1 (CPU Core 1)                          │
│     ├── Worker 2 (CPU Core 2)                          │
│     └── Worker 3 (CPU Core 3)                          │
│                                                         │
│  Load Balancer distributes requests across workers      │
└─────────────────────────────────────────────────────────┘
```

### Start with Specific Number of Instances
```sh
Syntax:- pm2 start <file> -i <number>
Example:- pm2 start app.js -i 4
```

### Start with MAX Instances (All CPU Cores)
```sh
Syntax:- pm2 start <file> -i max
Example:- pm2 start app.js -i max
```
This automatically detects and uses all available CPU cores.

### Start with MAX Instances and Custom Name
```sh
pm2 start app.js -i max --name "api-cluster"
```

### Check Number of CPU Cores
```sh
nproc
# OR
lscpu | grep "^CPU(s):"
```

### Scale Up/Down Running Cluster
```sh
Syntax:- pm2 scale <app-name> <number>
Example:- pm2 scale api-cluster 6
Example:- pm2 scale api-cluster +2   # Add 2 more instances
Example:- pm2 scale api-cluster -1   # Remove 1 instance
```

### Reload Cluster (Zero Downtime)
```sh
pm2 reload api-cluster
```
PM2 reloads instances one by one, ensuring zero downtime.

---

## Logs Management

PM2 automatically captures stdout and stderr from your applications.

### View All Logs (Real-time Stream)
```sh
pm2 logs
```

### View Logs for Specific App
```sh
Syntax:- pm2 logs <app-name-or-id>
Example:- pm2 logs my-api
```

### View Last N Lines of Logs
```sh
Syntax:- pm2 logs --lines <number>
Example:- pm2 logs --lines 100
Example:- pm2 logs my-api --lines 50
```

### View Only Error Logs
```sh
pm2 logs --err
```

### View Only Output Logs
```sh
pm2 logs --out
```

### Log File Locations
```sh
# Default log directory
~/.pm2/logs/

# Specific app logs
~/.pm2/logs/<app-name>-out.log    # stdout
~/.pm2/logs/<app-name>-error.log  # stderr
```

### View Log Files Directly
```sh
# View output log
cat ~/.pm2/logs/my-api-out.log

# View error log
cat ~/.pm2/logs/my-api-error.log

# Tail last lines
tail -100 ~/.pm2/logs/my-api-error.log

# Follow log in real-time
tail -f ~/.pm2/logs/my-api-out.log
```

### Flush/Clear All Logs
```sh
pm2 flush
```

### Flush Logs for Specific App
```sh
Syntax:- pm2 flush <app-name>
Example:- pm2 flush my-api
```

### Log Rotation (Prevent Large Log Files)
Install pm2-logrotate module:
```sh
pm2 install pm2-logrotate
```

Configure rotation settings:
```sh
# Max size before rotation (default: 10MB)
pm2 set pm2-logrotate:max_size 50M

# Retain last N rotated files
pm2 set pm2-logrotate:retain 10

# Compress rotated files
pm2 set pm2-logrotate:compress true

# Rotation interval
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'  # Daily at midnight
```

---

## Ecosystem File

For complex applications, use an ecosystem file to define all configurations.

### Generate Ecosystem File
```sh
pm2 ecosystem
```

### Example ecosystem.config.js
```javascript
module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./app.js",
      instances: "max",           // Use all CPU cores
      exec_mode: "cluster",       // Enable cluster mode
      watch: false,               // Don't watch for file changes in production
      max_memory_restart: "1G",   // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: "development",
        PORT: 3000
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080
      }
    },
    {
      name: "worker",
      script: "./worker.js",
      instances: 1,
      exec_mode: "fork",
      cron_restart: "0 0 * * *",  // Restart daily at midnight
    }
  ]
};
```

### Start with Ecosystem File
```sh
# Development
pm2 start ecosystem.config.js

# Production
pm2 start ecosystem.config.js --env production
```

### Useful Ecosystem Options
| Option | Description |
|--------|-------------|
| `instances` | Number of instances (`max` for all cores) |
| `exec_mode` | `cluster` or `fork` |
| `watch` | Restart on file changes |
| `max_memory_restart` | Memory threshold for restart |
| `cron_restart` | Cron pattern for scheduled restarts |
| `autorestart` | Auto restart on crash (default: true) |
| `log_date_format` | Date format in logs |

---

## Quick Reference Commands

| Command | Description |
|---------|-------------|
| `pm2 start app.js` | Start application |
| `pm2 start app.js --name "api"` | Start with custom name |
| `pm2 start app.js -i max` | Start in cluster mode (all cores) |
| `pm2 list` | List all processes |
| `pm2 stop all` | Stop all processes |
| `pm2 restart all` | Restart all processes |
| `pm2 delete all` | Delete all processes |
| `pm2 logs` | View all logs |
| `pm2 logs --lines 100` | View last 100 log lines |
| `pm2 flush` | Clear all logs |
| `pm2 monit` | Real-time monitoring |
| `pm2 startup` | Generate startup script |
| `pm2 save` | Save process list |
| `pm2 resurrect` | Restore saved processes |
