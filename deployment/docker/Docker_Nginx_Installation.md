# Nginx with Docker - Complete Guide

## Table of Contents
- [Quick Start](#quick-start)
- [Basic Nginx Setup](#basic-nginx-setup)
- [Custom Configuration](#custom-configuration)
- [Serving Static Files](#serving-static-files)
- [Reverse Proxy Setup](#reverse-proxy-setup)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Multi-Stage Build (Production)](#multi-stage-build-production)
- [Docker Compose Setup](#docker-compose-setup)
- [Common Use Cases](#common-use-cases)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Run Official Nginx Image

```bash
# Run nginx on port 80
docker run -d -p 80:80 --name nginx nginx

# Run nginx on custom port (e.g., 8080)
docker run -d -p 8080:80 --name nginx nginx:alpine

# Test
curl http://localhost:80
```

### Run with Volume (Serve Local Files)

```bash
# Serve files from current directory
docker run -d \
  -p 80:80 \
  --name nginx \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

---

## Basic Nginx Setup

### Pull Nginx Image

```bash
# Pull official nginx
docker pull nginx

# Pull alpine version (smaller)
docker pull nginx:alpine

# Pull specific version
docker pull nginx:1.25-alpine
```

### Run Nginx Container

```bash
# Basic run
docker run -d \
  --name mynginx \
  -p 80:80 \
  nginx:alpine

# With restart policy
docker run -d \
  --name mynginx \
  --restart unless-stopped \
  -p 80:80 \
  nginx:alpine

# With resource limits
docker run -d \
  --name mynginx \
  --memory="256m" \
  --cpus="0.5" \
  -p 80:80 \
  nginx:alpine
```

### Verify Nginx is Running

```bash
# Check container status
docker ps

# Check nginx logs
docker logs mynginx

# Test nginx
curl http://localhost
```

---

## Custom Configuration

### Create Custom nginx.conf

**nginx.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Run with Custom Config

```bash
# Mount custom nginx.conf
docker run -d \
  --name mynginx \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

---

## Serving Static Files

### Create Simple HTML Site

**html/index.html:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Docker Nginx Site</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 50px;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Hello from Docker Nginx! 🚀</h1>
    <p>This site is served by Nginx running in Docker</p>
</body>
</html>
```

### Run Nginx with Static Files

```bash
# Serve static files from ./html directory
docker run -d \
  --name static-site \
  -p 80:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx:alpine

# Test
curl http://localhost
```

### Custom Dockerfile for Static Site

**Dockerfile:**

```dockerfile
FROM nginx:alpine

# Copy static files
COPY html/ /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**

```bash
# Build image
docker build -t my-static-site .

# Run container
docker run -d -p 80:80 --name static-site my-static-site
```

---

## Reverse Proxy Setup

### Proxy to Backend API

**nginx.conf (Reverse Proxy):**

```nginx
upstream backend {
    server host.docker.internal:3000;  # Backend on host
    # Or use container name if in same network
    # server api:3000;
}

server {
    listen 80;
    server_name localhost;
    
    # Serve frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Run Reverse Proxy

```bash
docker run -d \
  --name nginx-proxy \
  -p 80:80 \
  -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

---

## SSL/HTTPS Setup

### Using Self-Signed Certificate

**Generate SSL Certificate:**

```bash
# Create directory for certs
mkdir -p ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/nginx.key \
  -out ssl/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

**nginx-ssl.conf:**

```nginx
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name localhost;
    
    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

**Run with SSL:**

```bash
docker run -d \
  --name nginx-ssl \
  -p 80:80 \
  -p 443:443 \
  -v $(pwd)/ssl:/etc/nginx/ssl:ro \
  -v $(pwd)/nginx-ssl.conf:/etc/nginx/conf.d/default.conf \
  -v $(pwd)/html:/usr/share/nginx/html \
  nginx:alpine
```

---

## Multi-Stage Build (Production)

### For React/Vue/Angular Apps

**Dockerfile (Multi-Stage Build):**

```dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf (SPA - Single Page App):**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA routing - always serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
}
```

**Build and Run:**

```bash
# Build the image
docker build -t my-react-app .

# Run the container
docker run -d -p 80:80 --name react-app my-react-app

# Test
curl http://localhost
```

---

## Docker Compose Setup

### Simple Static Site

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: nginx-web
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    networks:
      - webnet

networks:
  webnet:
    driver: bridge
```

### Full Stack with Backend

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  # Backend API
  api:
    image: node:18-alpine
    container_name: backend-api
    working_dir: /app
    command: npm start
    volumes:
      - ./backend:/app
    environment:
      - NODE_ENV=production
      - PORT=3000
    networks:
      - appnet

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html:ro
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - appnet

networks:
  appnet:
    driver: bridge
```

**nginx.conf (for Docker Compose):**

```nginx
upstream api {
    server api:3000;  # Use service name from docker-compose
}

server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Run:**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f nginx

# Stop services
docker-compose down
```

---

## Common Use Cases

### 1. Simple Static Website

```bash
# Create structure
mkdir -p website/html
echo "<h1>Hello World</h1>" > website/html/index.html

# Run nginx
docker run -d \
  --name website \
  -p 80:80 \
  -v $(pwd)/website/html:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 2. React/Vue Production Build

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Load Balancer

**nginx-lb.conf:**

```nginx
upstream backend_servers {
    server api1:3000;
    server api2:3000;
    server api3:3000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Multiple Sites (Virtual Hosts)

**nginx-vhosts.conf:**

```nginx
server {
    listen 80;
    server_name site1.local;
    root /usr/share/nginx/html/site1;
    index index.html;
}

server {
    listen 80;
    server_name site2.local;
    root /usr/share/nginx/html/site2;
    index index.html;
}
```

---

## Troubleshooting

### Check Nginx Configuration

```bash
# Test config syntax
docker exec mynginx nginx -t

# Reload nginx
docker exec mynginx nginx -s reload

# View nginx version
docker exec mynginx nginx -v
```

### View Logs

```bash
# Access logs
docker logs mynginx

# Follow logs in real-time
docker logs -f mynginx

# View nginx error log
docker exec mynginx cat /var/log/nginx/error.log
```

### Common Issues

**Port already in use:**
```bash
# Check what's using port 80
netstat -ano | findstr :80  # Windows
lsof -i :80                 # Linux/Mac

# Use different port
docker run -d -p 8080:80 nginx:alpine
```

**Permission denied:**
```bash
# Check volume permissions
ls -la ./html

# Run with proper permissions
chmod -R 755 ./html
```

**502 Bad Gateway (Reverse Proxy):**
```bash
# Check backend is running
curl http://localhost:3000

# Check nginx config
docker exec mynginx nginx -t

# View logs
docker logs mynginx
```

### Debug Commands

```bash
# Enter nginx container
docker exec -it mynginx sh

# Check nginx process
docker exec mynginx ps aux | grep nginx

# Check listening ports
docker exec mynginx netstat -tlnp

# View all nginx files
docker exec mynginx ls -la /etc/nginx/
```

---

## Quick Reference

### Essential Commands

| Task | Command |
|------|---------|
| Run nginx | `docker run -d -p 80:80 nginx:alpine` |
| With volume | `docker run -d -p 80:80 -v $(pwd)/html:/usr/share/nginx/html nginx:alpine` |
| With config | `docker run -d -p 80:80 -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine` |
| Test config | `docker exec mynginx nginx -t` |
| Reload nginx | `docker exec mynginx nginx -s reload` |
| View logs | `docker logs -f mynginx` |
| Enter container | `docker exec -it mynginx sh` |
| Stop | `docker stop mynginx` |
| Remove | `docker rm mynginx` |

### File Locations in Container

- **Default HTML**: `/usr/share/nginx/html/`
- **Config**: `/etc/nginx/nginx.conf`
- **Site config**: `/etc/nginx/conf.d/default.conf`
- **Access log**: `/var/log/nginx/access.log`
- **Error log**: `/var/log/nginx/error.log`

### Complete Example

```bash
# 1. Create project structure
mkdir -p mysite/{html,nginx}

# 2. Create index.html
cat > mysite/html/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>My Site</title></head>
<body><h1>Hello from Docker Nginx!</h1></body>
</html>
EOF

# 3. Create nginx.conf
cat > mysite/nginx/default.conf << 'EOF'
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
EOF

# 4. Run nginx
docker run -d \
  --name mysite \
  -p 80:80 \
  -v $(pwd)/mysite/html:/usr/share/nginx/html:ro \
  -v $(pwd)/mysite/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine

# 5. Test
curl http://localhost

# 6. View logs
docker logs -f mysite
```

**Remember**: Always use `:ro` (read-only) for config and static files in production! 🔒
