# Docker Documentation - Part 2

## Table of Contents
- [Environment Variables & Arguments](#environment-variables--arguments)
- [Docker Networking](#docker-networking)
- [Docker Compose Introduction](#docker-compose-introduction)
- [Multi-Container Applications](#multi-container-applications)
- [Best Practices](#best-practices)
- [Common Commands Reference](#common-commands-reference)
- [Troubleshooting](#troubleshooting)

---

## Environment Variables & Arguments

### Understanding ARG vs ENV

| Feature | ARG | ENV |
|---------|-----|-----|
| **Available** | Build time only | Build time + Runtime |
| **Defined in** | Dockerfile | Dockerfile or docker run |
| **Can be overridden** | During build | During run |
| **Visible in image** | No | Yes |
| **Use case** | Build configuration | Runtime configuration |

---

### ARG (Build Arguments)

**ARG** variables are only available during the image build process. They don't persist in the final image.

#### Defining ARG in Dockerfile

```dockerfile
# Define ARG with default value
ARG NODE_VERSION=18
ARG APP_PORT=3000

# Use ARG in FROM instruction
FROM node:${NODE_VERSION}

# Use ARG in other instructions
WORKDIR /app
EXPOSE ${APP_PORT}

# ARG can be defined multiple times
ARG BUILD_DATE
ARG VERSION

# Use in LABEL
LABEL build_date=${BUILD_DATE}
LABEL version=${VERSION}

COPY . .
RUN npm install

CMD ["node", "server.js"]
```

#### Passing ARG During Build

```bash
# Use default ARG values
docker build -t myapp .

# Override ARG values
docker build --build-arg NODE_VERSION=20 -t myapp .

# Override multiple ARG values
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_PORT=8080 \
  --build-arg VERSION=1.0.0 \
  -t myapp .

# Using shell variables
docker build \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VERSION=$(git rev-parse --short HEAD) \
  -t myapp .
```

#### Real-World ARG Examples

**Example 1: Multi-stage build with different base images**

```dockerfile
# Allow choosing base image
ARG BASE_IMAGE=node:18-alpine

FROM ${BASE_IMAGE} AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM ${BASE_IMAGE}
WORKDIR /app
COPY --from=builder /app .
CMD ["node", "app.js"]
```

```bash
# Build with default
docker build -t myapp .

# Build with different base
docker build --build-arg BASE_IMAGE=node:20-alpine -t myapp .
```

**Example 2: Conditional installation based on environment**

```dockerfile
ARG INSTALL_DEV_TOOLS=false

FROM node:18
WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Conditionally install dev tools
RUN if [ "$INSTALL_DEV_TOOLS" = "true" ]; then \
      npm install -g nodemon typescript; \
    fi

COPY . .
CMD ["node", "app.js"]
```

```bash
# Production build (no dev tools)
docker build -t myapp:prod .

# Development build (with dev tools)
docker build --build-arg INSTALL_DEV_TOOLS=true -t myapp:dev .
```

---

### ENV (Environment Variables)

**ENV** variables are available during build AND runtime. They persist in the final image.

#### Defining ENV in Dockerfile

```dockerfile
FROM node:18

# Single ENV
ENV NODE_ENV=production

# Multiple ENV (old syntax)
ENV PORT=3000
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# Multiple ENV (recommended syntax)
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info

WORKDIR /app
COPY . .

RUN npm install

# Use ENV in CMD
CMD node server.js --port ${PORT}
```

#### Accessing ENV in Application

**Node.js:**
```javascript
// app.js
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const dbHost = process.env.DB_HOST || 'localhost';

console.log(`Starting server on port ${port}`);
console.log(`Environment: ${nodeEnv}`);
console.log(`Database: ${dbHost}`);
```

**Python:**
```python
# app.py
import os

port = os.getenv('PORT', '3000')
node_env = os.getenv('NODE_ENV', 'development')
db_host = os.getenv('DB_HOST', 'localhost')

print(f"Starting server on port {port}")
print(f"Environment: {node_env}")
print(f"Database: {db_host}")
```

#### Overriding ENV at Runtime

```bash
# Using -e flag (single variable)
docker run -e NODE_ENV=development myapp

# Using -e flag (multiple variables)
docker run \
  -e NODE_ENV=development \
  -e PORT=8080 \
  -e DB_HOST=database.example.com \
  -e DB_USER=admin \
  -e DB_PASSWORD=secret \
  myapp

# Using --env flag (same as -e)
docker run --env NODE_ENV=production myapp
```

#### Using Environment File (--env-file)

**Create .env file:**

```bash
# .env or production.env
NODE_ENV=production
PORT=3000
DB_HOST=postgres.example.com
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=supersecret
API_KEY=abc123xyz
LOG_LEVEL=info
CACHE_ENABLED=true
```

**Use env file with docker run:**

```bash
# Single env file
docker run --env-file .env myapp

# Specific env file
docker run --env-file production.env myapp

# Multiple env files (later files override earlier)
docker run --env-file .env --env-file .env.local myapp

# Combine env file with -e flag (-e takes precedence)
docker run --env-file .env -e PORT=8080 myapp
```

**Example: Different environments**

```bash
# Development
docker run --env-file .env.development -p 3000:3000 myapp

# Staging
docker run --env-file .env.staging -p 3000:3000 myapp

# Production
docker run --env-file .env.production -p 80:3000 myapp
```

#### Complete Example: Web Application

**Dockerfile:**

```dockerfile
FROM node:18-alpine

# Build arguments
ARG BUILD_DATE
ARG VERSION

# Environment variables with defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_LEVEL=info

# Labels using ARG
LABEL maintainer="developer@example.com"
LABEL build_date=${BUILD_DATE}
LABEL version=${VERSION}

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port using ENV
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
```

**Build with ARG:**

```bash
docker build \
  --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  --build-arg VERSION=1.2.3 \
  -t myapp:1.2.3 \
  .
```

**Run with ENV:**

```bash
# Development
docker run -d \
  --name myapp-dev \
  -p 3000:3000 \
  -e NODE_ENV=development \
  -e LOG_LEVEL=debug \
  myapp:1.2.3

# Production
docker run -d \
  --name myapp-prod \
  -p 80:3000 \
  --env-file .env.production \
  myapp:1.2.3
```

#### Security Best Practices for ENV

```bash
# ❌ Bad: Secrets in Dockerfile
ENV DB_PASSWORD=supersecret
ENV API_KEY=abc123xyz

# ✅ Good: Pass secrets at runtime
docker run -e DB_PASSWORD=secret myapp

# ✅ Better: Use Docker secrets (Swarm mode)
echo "supersecret" | docker secret create db_password -

# ✅ Best: Use secrets management (Vault, AWS Secrets Manager)
docker run \
  -e DB_PASSWORD=$(aws secretsmanager get-secret-value --secret-id db_password --query SecretString --output text) \
  myapp
```

#### Combining ARG and ENV

```dockerfile
# Use ARG to set default, then use in ENV
ARG NODE_ENV_ARG=production
ENV NODE_ENV=${NODE_ENV_ARG}

# This allows:
# 1. Default value in Dockerfile
# 2. Override during build with --build-arg
# 3. Override during run with -e
```

```bash
# Use default (production)
docker build -t myapp .

# Override at build time
docker build --build-arg NODE_ENV_ARG=development -t myapp:dev .

# Override at runtime
docker run -e NODE_ENV=staging myapp
```

---

## Docker Networking

### Why Networking Matters

Containers need to communicate with:
- Other containers (microservices architecture)
- The host machine
- The outside world (internet)

### Network Drivers

| Driver | Description | Use Case |
|--------|-------------|----------|
| **bridge** | Default, private network on host | Container-to-container on same host |
| **host** | Use host's network directly | Performance-critical applications |
| **none** | No networking | Security, isolation |
| **overlay** | Multi-host networking | Docker Swarm, multi-host containers |
| **macvlan** | Assign MAC address to container | Legacy apps needing direct network access |

---

### Bridge Network (Default)

When you run a container, it's automatically connected to the default bridge network.

#### Default Bridge Network

```bash
# Run containers (connected to default bridge)
docker run -d --name web1 nginx
docker run -d --name web2 nginx
docker run -d --name web3 nginx

# Inspect default bridge network
docker network inspect bridge

# Containers on default bridge can communicate via IP
# But NOT via container name (no automatic DNS)
```

**Limitations of default bridge:**
- No automatic service discovery (can't use container names)
- Must use IP addresses (which can change)
- Less secure (all containers on default bridge can talk to each other)

#### User-Defined Bridge Network

**Advantages:**
- Automatic DNS resolution (use container names)
- Better isolation
- Can be created/deleted as needed
- Can connect/disconnect containers on the fly

**Creating User-Defined Bridge:**

```bash
# Create custom bridge network
docker network create my-network

# Create with specific subnet
docker network create --subnet=172.18.0.0/16 my-network

# Create with custom gateway
docker network create \
  --subnet=172.18.0.0/16 \
  --gateway=172.18.0.1 \
  my-network
```

**Using Custom Bridge:**

```bash
# Run containers on custom network
docker run -d --name web --network my-network nginx
docker run -d --name api --network my-network node:18

# Containers can communicate using names
docker exec web ping api  # Works!
docker exec api curl http://web  # Works!
```

---

### Container Communication

#### Method 1: Using Container IP (Not Recommended)

```bash
# Get container IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web

# Use IP to connect (not recommended - IP can change)
docker exec api curl http://172.17.0.2
```

**Why not recommended?**
- IP addresses change when container restarts
- Hard to manage in scripts
- No service discovery

#### Method 2: Using Container Name (Recommended)

**Only works on user-defined networks!**

```bash
# Create network
docker network create app-network

# Run containers
docker run -d --name database --network app-network postgres:15
docker run -d --name backend --network app-network myapi
docker run -d --name frontend --network app-network mynginx

# Backend can connect to database using name
# Connection string: postgresql://database:5432/mydb
```

#### Method 3: Using host.docker.internal

**Access host machine from container:**

```bash
# From inside container, access service on host
curl http://host.docker.internal:8080

# Example: Container accessing host's database
docker run -e DB_HOST=host.docker.internal myapp
```

**Use cases:**
- Development environment
- Accessing services on host machine
- Testing with local databases

---

### Networking Commands

```bash
# List networks
docker network ls

# Create network
docker network create my-network

# Inspect network
docker network inspect my-network

# Remove network
docker network rm my-network

# Remove all unused networks
docker network prune

# Connect running container to network
docker network connect my-network container_name

# Disconnect container from network
docker network disconnect my-network container_name
```

---

### MongoDB Networking Example

Let's create a complete example with MongoDB database and Node.js application.

#### Scenario Setup

```
┌─────────────────────────────────────┐
│         app-network                 │
│                                     │
│  ┌──────────┐      ┌─────────────┐ │
│  │ MongoDB  │◄────►│  Node.js    │ │
│  │  :27017  │      │  App :3000  │ │
│  └──────────┘      └─────────────┘ │
│                                     │
└─────────────────────────────────────┘
        ▲
        │ Port mapping
        │
    Host :3000
```

#### Step 1: Create Network

```bash
# Create custom bridge network
docker network create app-network
```

#### Step 2: Run MongoDB Container

```bash
# Run MongoDB with network
docker run -d \
  --name mongodb \
  --network app-network \
  -p 27017:27017 \
  -v mongo-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret123 \
  mongo:6

# Verify MongoDB is running
docker logs mongodb
```

**Explanation:**
- `--name mongodb` - Container name (used by other containers to connect)
- `--network app-network` - Connect to our custom network
- `-p 27017:27017` - Expose to host (optional, for external access)
- `-v mongo-data:/data/db` - Persistent storage
- `-e MONGO_INITDB_*` - Initialize with credentials

#### Step 3: Create Node.js Application

**app.js:**

```javascript
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection using container name
const MONGO_URL = process.env.MONGO_URL || 'mongodb://admin:secret123@mongodb:27017/myapp?authSource=admin';

// Connect to MongoDB
mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Simple schema
const ItemSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', ItemSchema);

// Routes
app.get('/', async (req, res) => {
  const items = await Item.find();
  res.json({ message: 'Hello from Docker!', items });
});

app.get('/add/:name', async (req, res) => {
  const item = new Item({ name: req.params.name });
  await item.save();
  res.json({ message: 'Item added', item });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`MongoDB URL: ${MONGO_URL}`);
});
```

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

**package.json:**

```json
{
  "name": "mongo-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0"
  }
}
```

#### Step 4: Build and Run Node.js Container

```bash
# Build image
docker build -t mongo-app .

# Run on same network as MongoDB
docker run -d \
  --name backend \
  --network app-network \
  -p 3000:3000 \
  -e MONGO_URL=mongodb://admin:secret123@mongodb:27017/myapp?authSource=admin \
  mongo-app

# Check logs
docker logs backend
```

**Key Point:** The connection string uses `mongodb` (container name) instead of IP address!

#### Step 5: Test the Application

```bash
# Test from host machine
curl http://localhost:3000

# Add items
curl http://localhost:3000/add/laptop
curl http://localhost:3000/add/phone
curl http://localhost:3000/add/tablet

# Get all items
curl http://localhost:3000
```

#### Step 6: Verify Network Connection

```bash
# See all containers on network
docker network inspect app-network

# Test connection from backend to MongoDB
docker exec backend ping mongodb

# Test MongoDB connection
docker exec backend nc -zv mongodb 27017

# Connect to MongoDB from another container
docker run -it --rm --network app-network mongo:6 \
  mongosh mongodb://admin:secret123@mongodb:27017/myapp?authSource=admin
```

---

### Advanced MongoDB Example: Multi-Container Setup

**Complete setup with MongoDB, Express API, and React Frontend:**

```bash
# Create network
docker network create fullstack-network

# MongoDB
docker run -d \
  --name mongo \
  --network fullstack-network \
  -v mongo-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=secret \
  mongo:6

# Express Backend
docker run -d \
  --name api \
  --network fullstack-network \
  -p 5000:5000 \
  -e MONGO_URL=mongodb://admin:secret@mongo:27017/app?authSource=admin \
  -e PORT=5000 \
  my-express-api

# React Frontend
docker run -d \
  --name frontend \
  --network fullstack-network \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:5000 \
  my-react-app

# Nginx Reverse Proxy
docker run -d \
  --name nginx \
  --network fullstack-network \
  -p 80:80 \
  -v ./nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine
```

**Communication flow:**
```
Browser → Nginx (80) → Frontend (80)
                    ↓
                    API (5000) → MongoDB (27017)
```

---

### Host Network

**Use host's network stack directly (no isolation).**

```bash
# Run with host network
docker run --network host nginx

# Container uses host's ports directly
# No need for -p flag
# Access at http://localhost:80
```

**Use cases:**
- Performance-critical applications
- Network monitoring tools
- Testing

**Limitations:**
- No network isolation
- Port conflicts with host
- Only works on Linux hosts

---

### None Network

**No networking at all.**

```bash
# Run with no network
docker run --network none alpine

# Container has no network access
# Useful for batch processing, security
```

---

### Network Troubleshooting

```bash
# Check if containers can communicate
docker exec container1 ping container2

# Check DNS resolution
docker exec container1 nslookup container2

# Check port connectivity
docker exec container1 nc -zv container2 3000

# Check network configuration
docker exec container1 ip addr
docker exec container1 route -n

# View container's network settings
docker inspect container_name | grep -A 20 NetworkSettings

# Test HTTP connectivity
docker exec container1 curl http://container2:3000

# View logs for network issues
docker logs container_name
```

---

## Docker Compose Introduction

### Why Docker Compose?

**Without Compose:**
```bash
# Create network
docker network create myapp-network

# Run database
docker run -d --name db --network myapp-network -v db-data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:15

# Run backend
docker run -d --name api --network myapp-network -p 5000:5000 -e DB_HOST=db myapi

# Run frontend
docker run -d --name web --network myapp-network -p 3000:80 myweb

# Many commands, hard to manage!
```

**With Compose:**
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: secret
  
  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: db
    depends_on:
      - db
  
  web:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  db-data:
```

```bash
# Start everything
docker-compose up -d

# Much simpler!
```

### Basic Compose Commands

```bash
# Start services
docker-compose up
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs
docker-compose logs -f api

# List services
docker-compose ps

# Execute command
docker-compose exec api bash

# Rebuild images
docker-compose build

# Scale services
docker-compose up -d --scale api=3
```

---

## Multi-Container Applications

### Example: Full-Stack Application

**Project Structure:**
```
my-fullstack-app/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── nginx/
    └── nginx.conf
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:6
    container_name: mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-secret123}
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network
    ports:
      - "27017:27017"

  # Express.js Backend
  backend:
    build: ./backend
    container_name: api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGO_URL: mongodb://admin:${MONGO_PASSWORD:-secret123}@mongodb:27017/myapp?authSource=admin
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - app-network
    volumes:
      - ./backend:/app
      - /app/node_modules

  # React Frontend
  frontend:
    build: ./frontend
    container_name: web
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: http://localhost:5000
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  mongo-data:
    driver: local

networks:
  app-network:
    driver: bridge
```

**.env file:**

```bash
MONGO_PASSWORD=supersecret
NODE_ENV=production
```

**Running:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## Best Practices

### 1. Dockerfile Best Practices

```dockerfile
# ✅ Use specific tags, not 'latest'
FROM node:18.16.0-alpine

# ✅ Use non-root user
USER node

# ✅ Multi-stage builds for smaller images
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# ✅ Order layers by change frequency (least to most)
COPY package*.json ./
RUN npm install
COPY . .

# ✅ Clean up in same layer
RUN apt-get update && \
    apt-get install -y package && \
    rm -rf /var/lib/apt/lists/*

# ✅ Use .dockerignore
# Create .dockerignore file

# ✅ Use COPY instead of ADD (unless extracting archives)
COPY . .

# ✅ Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```

### 2. Security Best Practices

```bash
# ✅ Scan images for vulnerabilities
docker scan myapp:latest

# ✅ Don't store secrets in images
# Use environment variables or secrets management

# ✅ Use minimal base images
FROM alpine
FROM node:18-alpine

# ✅ Keep images updated
docker pull node:18-alpine
docker build --pull -t myapp .

# ✅ Limit container resources
docker run --memory="512m" --cpus="1.0" myapp

# ✅ Use read-only filesystems when possible
docker run --read-only myapp

# ✅ Drop unnecessary capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myapp
```

### 3. Performance Best Practices

```bash
# ✅ Use layer caching effectively
# Copy package files first, then source code

# ✅ Use multi-stage builds
# Keep final image small

# ✅ Minimize layers
# Combine RUN commands

# ✅ Use .dockerignore
# Reduce build context size

# ✅ Use appropriate base images
# Alpine for small size, Debian for compatibility

# ✅ Clean package manager cache
RUN npm ci --only=production && npm cache clean --force
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
```

### 4. Development Workflow

```bash
# ✅ Use volumes for development
docker run -v $(pwd):/app myapp

# ✅ Use docker-compose for multi-container apps
docker-compose up -d

# ✅ Use environment-specific configs
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# ✅ Use health checks
HEALTHCHECK CMD curl -f http://localhost/ || exit 1

# ✅ Use proper logging
# Log to stdout/stderr, not files
```

### 5. Container Naming

```bash
# ✅ Use meaningful names
docker run --name myapp-web nginx
docker run --name myapp-db postgres

# ✅ Use consistent naming convention
docker run --name ${PROJECT}-${SERVICE}-${ENV} myapp
```

### 6. Resource Management

```bash
# ✅ Remove unused resources regularly
docker system prune -a
docker volume prune
docker network prune

# ✅ Limit container resources
docker run --memory="1g" --cpus="2.0" myapp

# ✅ Set restart policies
docker run --restart=unless-stopped myapp
```

---

## Common Commands Reference

### Image Commands

```bash
# List images
docker images
docker image ls

# Pull image
docker pull image:tag

# Build image
docker build -t name:tag .
docker build -t name:tag -f Dockerfile.dev .

# Remove image
docker rmi image
docker image rm image

# Tag image
docker tag source:tag target:tag

# Push image
docker push username/image:tag

# Inspect image
docker image inspect image

# History
docker history image

# Prune images
docker image prune
docker image prune -a
```

### Container Commands

```bash
# Run container
docker run image
docker run -d image
docker run -it image bash
docker run --name name image
docker run -p host:container image
docker run -v host:container image
docker run -e KEY=value image
docker run --rm image

# List containers
docker ps
docker ps -a
docker ps -q

# Start/Stop
docker start container
docker stop container
docker restart container
docker kill container

# Remove container
docker rm container
docker rm -f container

# Logs
docker logs container
docker logs -f container
docker logs --tail 100 container

# Execute command
docker exec container command
docker exec -it container bash

# Inspect
docker inspect container

# Stats
docker stats
docker stats container

# Copy files
docker cp local container:/path
docker cp container:/path local

# Attach
docker attach container

# Prune containers
docker container prune
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Create volume
docker volume create name

# Inspect volume
docker volume inspect name

# Remove volume
docker volume rm name

# Prune volumes
docker volume prune
```

### Network Commands

```bash
# List networks
docker network ls

# Create network
docker network create name

# Inspect network
docker network inspect name

# Connect container
docker network connect network container

# Disconnect container
docker network disconnect network container

# Remove network
docker network rm name

# Prune networks
docker network prune
```

### System Commands

```bash
# Show disk usage
docker system df

# Remove unused data
docker system prune
docker system prune -a
docker system prune --volumes

# Show system info
docker info
docker version
```

### Docker Compose Commands

```bash
# Start services
docker-compose up
docker-compose up -d
docker-compose up --build

# Stop services
docker-compose down
docker-compose down -v

# View logs
docker-compose logs
docker-compose logs -f service

# List services
docker-compose ps

# Execute command
docker-compose exec service bash

# Build services
docker-compose build
docker-compose build --no-cache

# Scale services
docker-compose up -d --scale service=3

# Restart services
docker-compose restart
docker-compose restart service
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Container Exits Immediately

```bash
# Check logs
docker logs container_name

# Run interactively to debug
docker run -it image bash

# Check if command is correct
docker inspect container_name
```

#### 2. Port Already in Use

```bash
# Find process using port (Linux/Mac)
lsof -i :8080

# Find process using port (Windows)
netstat -ano | findstr :8080

# Use different host port
docker run -p 8081:80 nginx
```

#### 3. Cannot Connect to Container

```bash
# Check if container is running
docker ps

# Check port mappings
docker port container_name

# Check network
docker network inspect bridge

# Test from inside container
docker exec container curl localhost:80
```

#### 4. Volume Data Not Persisting

```bash
# Verify volume mount
docker inspect container_name | grep Mounts -A 10

# Check volume exists
docker volume ls
docker volume inspect volume_name

# Verify path in container
docker exec container ls -la /path
```

#### 5. Build Context Too Large

```bash
# Create/update .dockerignore
echo "node_modules" >> .dockerignore
echo ".git" >> .dockerignore

# Check build context size
docker build --no-cache -t test .
# Look for "Sending build context to Docker daemon"
```

#### 6. Out of Disk Space

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a --volumes

# Remove specific items
docker image prune
docker container prune
docker volume prune
docker network prune
```

#### 7. Permission Denied

```bash
# Fix file permissions
chmod +x script.sh

# Run as root user
docker exec -u root container command

# Change owner in Dockerfile
RUN chown -R node:node /app
USER node
```

#### 8. Network Issues Between Containers

```bash
# Verify network
docker network ls
docker network inspect network_name

# Check if containers are on same network
docker inspect container1 | grep NetworkMode
docker inspect container2 | grep NetworkMode

# Test connectivity
docker exec container1 ping container2
docker exec container1 curl http://container2:port
```

#### 9. Environment Variables Not Working

```bash
# Check env vars in container
docker exec container env

# Verify env file
cat .env

# Check if prefix is correct (for Dockerfile ENV)
docker inspect container | grep Env -A 20
```

#### 10. Image Build Fails

```bash
# Build without cache
docker build --no-cache -t image .

# Build with verbose output
docker build --progress=plain -t image .

# Check Dockerfile syntax
docker build -t image . 2>&1 | more
```

### Debugging Tools

```bash
# View all container details
docker inspect container

# Stream container stats
docker stats container

# Check container processes
docker top container

# View container filesystem changes
docker diff container

# Export container filesystem
docker export container > container.tar

# Save image to tar
docker save image > image.tar

# Load image from tar
docker load < image.tar

# View Docker events
docker events
docker events --filter 'container=container_name'
```

### Performance Debugging

```bash
# Check resource usage
docker stats

# Limit resources
docker run --memory="512m" --cpus="1.0" image

# Check layer sizes
docker history image

# Analyze image
docker image inspect image | grep Size
```

---

## Summary

This comprehensive Docker documentation covers:

✅ **Environment Variables & Build Arguments** - ARG vs ENV, runtime configuration  
✅ **Docker Networking** - Bridge, host, custom networks, container communication  
✅ **MongoDB Example** - Complete multi-container setup with networking  
✅ **Docker Compose** - Multi-container orchestration  
✅ **Best Practices** - Security, performance, development workflows  
✅ **Command Reference** - Complete command cheatsheet  
✅ **Troubleshooting** - Common issues and solutions  

**Key Takeaways:**

1. Use **user-defined networks** for container communication
2. Use **container names** instead of IP addresses
3. Use **ENV variables** for runtime configuration
4. Use **ARG** for build-time configuration
5. Use **docker-compose** for multi-container apps
6. Always use **.dockerignore** to optimize builds
7. Follow **security best practices** (non-root users, scan images)
8. Use **volumes** for data persistence
9. Keep images **small and secure** (multi-stage builds, Alpine)
10. **Clean up regularly** to save disk space

Happy Dockerizing! 🐳
