# Nginx Installation and Setup on Windows

## Introduction
This guide provides step-by-step instructions to install and configure Nginx on a Windows system. It also addresses common issues such as port conflicts and ensures Nginx starts automatically on system startup.

## Prerequisites
- Download the Nginx binary for Windows from the [official website](https://nginx.org/en/download.html).
- Download `nssm` (Non-Sucking Service Manager) from [nssm.cc](https://nssm.cc/download).

## Steps

### 1. Extract Nginx
Extract the downloaded Nginx ZIP file to a directory, for example, `C:\nginx-1.27.4`.

### 2. Check for Port 80 Conflicts
Open Command Prompt with administrative privileges and run the following command to check if port 80 is in use:
```sh
netstat -ano | findstr :80
```
If you see output indicating that port 80 is in use, note the PID (Process ID).

### 3. Identify the Application Using Port 80
Run the following command to identify the application using the PID:
```sh
tasklist /FI "PID eq <PID>"
```
Replace `<PID>` with the actual PID you found.

### 4. Stop the Conflicting Service
If the conflicting service is the "World Wide Web Publishing Service", follow these steps to stop and disable it:
1. Press `Win + R`, type `services.msc`, and press Enter.
2. Scroll down to find "World Wide Web Publishing Service".
3. Right-click on the service, select "Properties", set the "Startup type" to "Disabled", and click "Stop".
4. Click "Apply" and then "OK".

### 5. Install Nginx as a Windows Service Using `nssm`
1. Extract the downloaded `nssm` ZIP file to a directory, for example, `C:\nssm`.
2. Open Command Prompt with administrative privileges and run the following command:
   ```sh
   C:\nssm\nssm.exe install nginx
   ```
3. In the `nssm` service installer GUI:
   - **Path:** Set to the path of `nginx.exe` (e.g., `C:\nginx-1.27.4\nginx.exe`).
   - **Startup directory:** Set to the nginx directory (e.g., `C:\nginx-1.27.4`).
   - **Arguments:** Leave this field empty.
   - Click "Install Service".

### 6. Configure Nginx to Start Automatically
Run the following commands:
```sh
sc config nginx start= auto
net start nginx

#we can also start from the service.msc. Find the nginx and start.
```

### 7. Verify the Configuration
1. Open Services (`services.msc`) and ensure that the "nginx" service is set to "Automatic".
2. Restart your computer to verify that the World Wide Web Publishing Service does not start and nginx starts automatically.

### Summary of Commands
```shell
# Disable World Wide Web Publishing Service
sc config W3SVC start= disabled
net stop W3SVC

# Install and configure nginx service using nssm
C:\nssm\nssm.exe install nginx
sc config nginx start= auto
net start nginx
```

## Conclusion
By following these steps, you can successfully install and configure Nginx on a Windows system, resolve port conflicts, and ensure that Nginx starts automatically on system startup.