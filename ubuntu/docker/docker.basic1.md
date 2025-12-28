# Docker Documentation - Complete Reference Guide

## Table of Contents
- [What is Docker?](#what-is-docker)
- [Core Concepts](#core-concepts)
- [Dockerfile](#dockerfile)
- [Docker Images](#docker-images)
- [Docker Containers](#docker-containers)
- [Container Modes](#container-modes)
- [Image Tags & Versioning](#image-tags--versioning)
- [Docker Hub](#docker-hub)
- [Docker Volumes](#docker-volumes)
- [Docker Ignore File](#docker-ignore-file)
- [Environment Variables & Arguments](#environment-variables--arguments)
- [Docker Networking](#docker-networking)
- [Best Practices](#best-practices)
- [Common Commands Reference](#common-commands-reference)

---

## What is Docker?

**Docker** is a platform for developing, shipping, and running applications in containers. It solves the classic "it works on my machine" problem by packaging applications with all their dependencies into standardized units called containers.

### Problems Docker Solves:

#### 1. **Environment Consistency**
- **Problem**: Application works on development machine but fails in production
- **Solution**: Docker ensures the same environment across all stages (dev, test, prod)

#### 2. **Dependency Management**
- **Problem**: Managing different versions of libraries, languages, and system dependencies
- **Solution**: Each container has its own isolated dependencies

#### 3. **Resource Efficiency**
- **Problem**: Virtual machines are heavy and slow to start
- **Solution**: Containers share the host OS kernel, making them lightweight and fast

#### 4. **Scalability**
- **Problem**: Difficult to scale applications horizontally
- **Solution**: Easy to spin up multiple container instances

#### 5. **Isolation**
- **Problem**: Applications interfere with each other on the same server
- **Solution**: Containers provide process and filesystem isolation

#### 6. **Portability**
- **Problem**: Vendor lock-in and platform dependencies
- **Solution**: Containers run anywhere - laptop, cloud, on-premises

---

## Core Concepts

### 1. Docker Image
- **What**: A read-only template containing application code, runtime, libraries, and dependencies
- **Like**: A blueprint or class in programming
- **Characteristics**:
  - Immutable (cannot be changed)
  - Built in layers
  - Can be versioned with tags
  - Stored in registries (Docker Hub, private registries)

### 2. Docker Container
- **What**: A running instance of an image
- **Like**: An object created from a class
- **Characteristics**:
  - Isolated runtime environment
  - Has its own filesystem, networking, and process space
  - Can be started, stopped, deleted
  - Multiple containers can run from the same image

### 3. Relationship Between Image and Container

```
Image (Blueprint)          Container (Running Instance)
     ↓                              ↓
ubuntu:20.04      →     container1 (running)
                  →     container2 (running)
                  →     container3 (stopped)
```

**One image can run multiple containers** - each container is an isolated instance.

---

## Dockerfile

### What is a Dockerfile?

A **Dockerfile** is a text file containing step-by-step instructions to build a Docker image. Each instruction creates a new layer in the image.

### Layer-Based Architecture

```dockerfile
FROM node:18          # Layer 1 - Base image
WORKDIR /app          # Layer 2 - Set working directory
COPY package.json .   # Layer 3 - Copy package file
RUN npm install       # Layer 4 - Install dependencies
COPY . .              # Layer 5 - Copy source code
CMD ["node", "app.js"]# Layer 6 - Default command
```

**Key Points:**
- Each instruction creates a new layer
- Layers are cached for faster rebuilds
- Only changed layers are rebuilt
- Order matters for cache optimization

### Creating a Simple Node.js Dockerfile

#### Example 1: Basic Node.js Application

```dockerfile
# Use official Node.js image as base
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Define environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "server.js"]
```

#### Example 2: Multi-Stage Build (Optimized)

```dockerfile
# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Stage 2: Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "server.js"]
```

### Building an Image from Dockerfile

```bash
# Build image from current directory (. means current path)
docker build -t myapp:1.0 .

# Build with specific Dockerfile name
docker build -t myapp:1.0 -f Dockerfile.dev .

# Build with build arguments
docker build --build-arg NODE_VERSION=18 -t myapp:1.0 .

# Build without cache
docker build --no-cache -t myapp:1.0 .
```

**Explanation of `.` (dot):**
- The `.` represents the build context (current directory)
- Docker sends all files in this directory to the Docker daemon
- This is where the Dockerfile should be located

### Common Dockerfile Instructions

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image | `FROM node:18` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files from host to container | `COPY . .` |
| `ADD` | Copy and extract archives | `ADD file.tar.gz /app` |
| `RUN` | Execute commands during build | `RUN npm install` |
| `CMD` | Default command when container starts | `CMD ["npm", "start"]` |
| `ENTRYPOINT` | Configure container as executable | `ENTRYPOINT ["node"]` |
| `EXPOSE` | Document which ports to expose | `EXPOSE 3000` |
| `ENV` | Set environment variables | `ENV NODE_ENV=production` |
| `ARG` | Build-time variables | `ARG VERSION=1.0` |
| `VOLUME` | Create mount point | `VOLUME /data` |
| `USER` | Set user for commands | `USER node` |
| `LABEL` | Add metadata | `LABEL version="1.0"` |

### Layer Caching Best Practices

```dockerfile
# ❌ Bad - Installs dependencies every time code changes
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "app.js"]

# ✅ Good - Leverages cache for dependencies
FROM node:18
WORKDIR /app
COPY package*.json ./    # Copy package files first
RUN npm install          # This layer is cached
COPY . .                 # Only rebuild this when code changes
CMD ["node", "app.js"]
```

---

## Docker Images

### Listing Images

```bash
# List all images
docker images

# List images with more details
docker images -a

# List image IDs only
docker images -q

# Filter images
docker images --filter "dangling=true"
docker images --filter "reference=node:*"
```

### Pulling Images

```bash
# Pull latest version
docker pull ubuntu

# Pull specific version
docker pull ubuntu:20.04
docker pull node:18-alpine
docker pull postgres:15.2

# Pull from specific registry
docker pull ghcr.io/user/repo:tag
```

### Inspecting Images

```bash
# Detailed image information
docker image inspect ubuntu:20.04

# View image history (layers)
docker history ubuntu:20.04

# Get specific information using format
docker image inspect --format='{{.Config.ExposedPorts}}' nginx
docker image inspect --format='{{.Config.Env}}' node:18
```

### Removing Images

```bash
# Remove single image
docker rmi image_name
docker rmi image_id

# Remove multiple images
docker rmi image1 image2 image3

# Remove all unused images
docker image prune

# Remove all images (careful!)
docker rmi $(docker images -q)

# Force remove (even if containers exist)
docker rmi -f image_name
```

**Important**: You can only remove images that are not being used by any container (running or stopped). Use `-f` flag to force removal.

### Image Size Optimization

```dockerfile
# Use Alpine-based images (smaller)
FROM node:18-alpine  # ~170MB instead of node:18 (~900MB)

# Multi-stage builds
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Clean up in same layer
RUN apt-get update && \
    apt-get install -y package && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

## Docker Containers

### Basic Container Commands

```bash
# Get help on all docker commands
docker --help

# Get help on specific command
docker run --help
docker ps --help
```

### Running Containers

```bash
# Run container from image
docker run ubuntu

# Run with custom name
docker run --name my-container ubuntu

# Run and remove after exit
docker run --rm ubuntu

# Run specific command
docker run ubuntu echo "Hello Docker"

# Run with environment variable
docker run -e NODE_ENV=production node

# Run with port mapping
docker run -p 8080:80 nginx

# Run with volume
docker run -v /host/path:/container/path ubuntu
```

### Listing Containers

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List container IDs only
docker ps -q

# List with custom format
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}"

# List with size
docker ps -s
```

### Starting and Stopping Containers

```bash
# Start stopped container
docker start container_name
docker start container_id

# Stop running container
docker stop container_name
docker stop container_id

# Restart container
docker restart container_name

# Pause container (freeze processes)
docker pause container_name

# Unpause container
docker unpause container_name

# Kill container (force stop)
docker kill container_name
```

### Removing Containers

```bash
# Remove stopped container
docker rm container_name
docker rm container_id

# Remove multiple containers
docker rm container1 container2 container3

# Remove all stopped containers
docker container prune

# Remove running container (force)
docker rm -f container_name

# Remove container automatically after exit
docker run --rm ubuntu
```

### Container Logs and Inspection

```bash
# View container logs
docker logs container_name

# Follow logs in real-time
docker logs -f container_name

# Show last N lines
docker logs --tail 100 container_name

# Show logs with timestamps
docker logs -t container_name

# Inspect container details
docker inspect container_name

# View container processes
docker top container_name

# View container resource usage
docker stats container_name

# View all containers stats
docker stats
```

### Executing Commands in Running Containers

```bash
# Execute command in running container
docker exec container_name ls /app

# Execute interactive bash
docker exec -it container_name bash

# Execute as specific user
docker exec -u root container_name whoami

# Execute in specific working directory
docker exec -w /app container_name npm test
```

### Copying Files Between Host and Container

```bash
# Copy from local to container
docker cp /local/path/file.txt container_name:/container/path/

# Copy directory from local to container
docker cp /local/directory container_name:/container/path/

# Copy from container to local
docker cp container_name:/container/path/file.txt /local/path/

# Copy directory from container to local
docker cp container_name:/app/logs ./logs

# Copy multiple files
docker cp file1.txt container_name:/app/ && docker cp file2.txt container_name:/app/
```

**Examples:**

```bash
# Copy config file to nginx container
docker cp nginx.conf my-nginx:/etc/nginx/nginx.conf

# Copy logs from container to host
docker cp my-app:/var/log/app.log ./logs/

# Copy entire build directory from container
docker cp my-builder:/app/dist ./build/
```

---

## Container Modes

### 1. Attached vs Detached Mode

#### Detached Mode (Background)
**Default mode** - Container runs in background and doesn't block terminal.

```bash
# Run in detached mode (most common)
docker run -d nginx

# Run with name in detached mode
docker run -d --name my-nginx nginx

# Run Ubuntu in detached mode with interactive terminal
docker run -it -d ubuntu
```

**Use cases:**
- Web servers (nginx, Apache)
- Databases (MySQL, PostgreSQL)
- Long-running services
- Background tasks

#### Attached Mode (Foreground)
Container output is connected to your terminal.

```bash
# Run in attached mode (default without -d)
docker run ubuntu

# Attach to running detached container
docker attach container_name

# Attach to stopped container (start + attach)
docker start -a container_name

# Attach with interactive mode
docker start -ai container_name
```

**Use cases:**
- Viewing real-time logs
- Debugging
- One-off commands
- Interactive sessions

### 2. Interactive Mode

Allows you to interact with the container's terminal.

```bash
# Run with interactive terminal
docker run -it ubuntu bash

# Run with interactive terminal in detached mode
docker run -it -d ubuntu bash

# Attach to stopped container with interactive mode
docker start -ai container_name

# Execute interactive bash in running container
docker exec -it container_name bash

# Execute interactive shell (sh for Alpine)
docker exec -it container_name sh
```

**Flags explained:**
- `-i` (interactive): Keep STDIN open even if not attached
- `-t` (tty): Allocate a pseudo-TTY (terminal)
- `-it`: Combination of both - interactive terminal

**Examples:**

```bash
# Interactive Python REPL
docker run -it python:3.11

# Interactive Node.js REPL
docker run -it node:18

# Interactive Ubuntu shell
docker run -it ubuntu bash

# Interactive MySQL client
docker run -it mysql:8 mysql -h host -u user -p
```

### 3. Auto-Remove Mode

Container is automatically removed when it exits.

```bash
# Run and auto-remove after exit
docker run --rm ubuntu echo "Hello"

# Run interactive container that removes itself
docker run -it --rm ubuntu bash

# Run with auto-remove and custom name
docker run --rm --name temp-container nginx

# Combine with detached mode
docker run -d --rm nginx
```

**Use cases:**
- Testing containers
- One-time tasks
- CI/CD pipelines
- Temporary environments

### Mode Combinations

```bash
# Detached + Interactive + Auto-remove
docker run -dit --rm ubuntu bash

# Detached + Port mapping + Named
docker run -d -p 8080:80 --name web nginx

# Interactive + Volume + Environment variable
docker run -it -v $(pwd):/app -e DEBUG=true node:18 bash

# Complete example: Dev environment
docker run -dit --rm \
  --name dev-container \
  -p 3000:3000 \
  -v $(pwd):/app \
  -w /app \
  -e NODE_ENV=development \
  node:18 \
  bash
```

---

## Image Tags & Versioning

### Understanding Image Tags

An image tag is a label attached to an image to identify different versions.

**Format**: `repository:tag` or `registry/repository:tag`

```
nginx:latest          # Latest version
nginx:1.25           # Specific version
nginx:1.25-alpine    # Version + variant
ubuntu:20.04         # Ubuntu 20.04
ubuntu:22.04         # Ubuntu 22.04
node:18              # Node.js 18
node:18-alpine       # Node.js 18 Alpine variant
```

### Default Tag: latest

```bash
# These are equivalent
docker pull ubuntu
docker pull ubuntu:latest

# These are equivalent
docker build -t myapp .
docker build -t myapp:latest .
```

**Warning**: `latest` doesn't necessarily mean the newest version. It's just the default tag when none is specified.

### Pulling Specific Tags

```bash
# Pull specific Ubuntu version
docker pull ubuntu:20.04
docker pull ubuntu:22.04

# Pull specific Node version
docker pull node:18
docker pull node:18-alpine
docker pull node:18.16.0

# Pull specific database version
docker pull postgres:15
docker pull postgres:15.2-alpine
docker pull mysql:8.0
```

### Building Images with Tags

```bash
# Build with tag
docker build -t myapp:1.0 .

# Build with version tag
docker build -t myapp:v2.3.1 .

# Build with environment tag
docker build -t myapp:dev .
docker build -t myapp:prod .

# Build with multiple tags
docker build -t myapp:1.0 -t myapp:latest .
```

### Tagging Existing Images

```bash
# Create new tag for existing image
docker tag myapp:1.0 myapp:latest
docker tag myapp:1.0 myapp:stable

# Tag for Docker Hub (username/repo:tag)
docker tag myapp:1.0 username/myapp:1.0
docker tag test:1 mdazkar/myapp:v1.0

# Tag for private registry
docker tag myapp:1.0 registry.company.com/myapp:1.0
```

**Important**: Tagging creates a new reference (alias) to the same image, not a copy. Both tags point to the same image ID.

### Tagging Best Practices

```bash
# Semantic versioning
docker build -t myapp:1.0.0 .
docker build -t myapp:1.0 .
docker build -t myapp:1 .
docker build -t myapp:latest .

# Environment-based tags
docker build -t myapp:dev .
docker build -t myapp:staging .
docker build -t myapp:prod .

# Git-based tags
docker build -t myapp:$(git rev-parse --short HEAD) .
docker build -t myapp:commit-abc123 .

# Date-based tags
docker build -t myapp:2024-12-02 .
```

### Listing Image Tags

```bash
# List all images with tags
docker images

# List specific repository tags
docker images nginx
docker images myapp

# Filter by tag pattern
docker images "myapp:1.*"
```

---

## Docker Hub

### What is Docker Hub?

Docker Hub is a cloud-based registry service for sharing Docker images. It's like GitHub but for Docker images.

**Features:**
- Public and private repositories
- Official images from software vendors
- Automated builds
- Webhooks and integrations
- Team collaboration

### Pushing Images to Docker Hub

#### Step 1: Create Docker Hub Account
1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up for free account
3. Create a repository (optional, auto-created on first push)

#### Step 2: Login to Docker Hub

```bash
# Login (first time only)
docker login

# Login with username
docker login -u username

# Login to specific registry
docker login registry.example.com
```

#### Step 3: Tag Image with Correct Name

**Format**: `username/repository:tag`

```bash
# Tag existing image for Docker Hub
docker tag myapp:1.0 username/myapp:1.0
docker tag myapp:1.0 username/myapp:latest

# Example: Tag local image
docker tag test:1 mdazkar/test:v1.0
docker tag local-app:latest mdazkar/my-app:1.0
```

**Note**: The image name must include your Docker Hub username. Tagging creates an alias, not a copy.

#### Step 4: Push Image to Docker Hub

```bash
# Push tagged image
docker push username/repository:tag

# Examples:
docker push mdazkar/myapp:1.0
docker push mdazkar/myapp:latest

# Push all tags of a repository
docker push username/myapp --all-tags
```

### Complete Example: Build and Push

```bash
# 1. Build image
docker build -t myapp:1.0 .

# 2. Test image locally
docker run -d -p 8080:80 myapp:1.0

# 3. Tag for Docker Hub
docker tag myapp:1.0 mdazkar/myapp:1.0
docker tag myapp:1.0 mdazkar/myapp:latest

# 4. Login to Docker Hub
docker login

# 5. Push to Docker Hub
docker push mdazkar/myapp:1.0
docker push mdazkar/myapp:latest

# 6. Verify on Docker Hub
# Visit: https://hub.docker.com/r/mdazkar/myapp
```

### Pulling Images from Docker Hub

```bash
# Pull your own images
docker pull mdazkar/myapp:1.0
docker pull username/repository:tag

# Pull official images
docker pull nginx
docker pull node:18
docker pull postgres:15

# Pull and run
docker run -d -p 80:80 mdazkar/myapp:latest
docker run -p 8080:80 -d username/myapp:tagname
```

### Managing Docker Hub Repositories

```bash
# List local images
docker images

# Remove local image
docker rmi username/repository:tag

# Logout from Docker Hub
docker logout
```

### Private vs Public Repositories

**Public Repository:**
- Anyone can pull
- Free unlimited public repos
- Visible on Docker Hub

**Private Repository:**
- Only you and authorized users can access
- Free tier: 1 private repository
- Paid plans: Unlimited private repos

### Working with Private Repositories

```bash
# Login required to pull private images
docker login

# Pull private image
docker pull username/private-repo:tag

# Share access: On Docker Hub website
# Settings → Collaborators → Add username
```

### Docker Hub Alternatives

```bash
# GitHub Container Registry
docker login ghcr.io
docker tag myapp:1.0 ghcr.io/username/myapp:1.0
docker push ghcr.io/username/myapp:1.0

# Amazon ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.region.amazonaws.com
docker push <account>.dkr.ecr.region.amazonaws.com/myapp:1.0

# Google Container Registry
docker tag myapp:1.0 gcr.io/project-id/myapp:1.0
docker push gcr.io/project-id/myapp:1.0

# Azure Container Registry
docker login myregistry.azurecr.io
docker push myregistry.azurecr.io/myapp:1.0
```

---

## Docker Volumes

### Why Volumes?

**Problem**: Container data is ephemeral - when you delete a container, all data inside is lost.

**Solution**: Volumes provide persistent storage that survives container deletion.

### Three Types of Volumes

| Type | Managed By | Path Visibility | Persistence | Sharing |
|------|------------|-----------------|-------------|---------|
| **Anonymous** | Docker | Unknown to user | Deleted with container | No |
| **Named** | Docker | Unknown to user | Survives deletion | Yes |
| **Bind Mount** | User | Known to user | User controlled | Yes |

---

### 1. Anonymous Volumes

**Characteristics:**
- Created for a single container
- Path managed by Docker (unknown location)
- Automatically removed when container is removed (with `--rm`)
- NOT removed when container is stopped
- Cannot be shared across containers

#### Creating Anonymous Volumes

**Method 1: Using Dockerfile**

```dockerfile
FROM node:18
WORKDIR /app
COPY . .

# Create anonymous volume for logs
VOLUME /app/logs

CMD ["node", "app.js"]
```

**Method 2: Using -v flag**

```bash
# Create anonymous volume for /app/data
docker run -v /app/data myapp

# With auto-remove (volume deleted when container removed)
docker run --rm -v /app/data myapp

# Multiple anonymous volumes
docker run -v /app/logs -v /app/temp myapp
```

#### Use Cases:
- Temporary caching
- Files that don't need to persist
- Performance optimization for node_modules

```bash
# Example: Prevent overwriting node_modules with bind mount
docker run -v /app/node_modules -v $(pwd):/app node:18
```

---

### 2. Named Volumes

**Characteristics:**
- Created explicitly with a name
- Path managed by Docker (unknown location)
- Survives container deletion, restart, and shutdown
- Can be shared across multiple containers
- Managed through Docker CLI

#### Creating Named Volumes

```bash
# Create named volume
docker volume create my-data

# Create during container run
docker run -v data-volume:/app/data myapp

# With specific name
docker run -v mysql-data:/var/lib/mysql mysql:8
docker run -v postgres-data:/var/lib/postgresql/data postgres:15
```

#### Real-World Examples

```bash
# Database persistence
docker run -d \
  --name mysql-db \
  -v mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  mysql:8

# MongoDB persistence
docker run -d \
  --name mongodb \
  -v mongo-data:/data/db \
  -p 27017:27017 \
  mongo:6

# Application data
docker run -d \
  --name myapp \
  -v app-data:/app/data \
  -v app-logs:/app/logs \
  myapp:latest
```

#### Sharing Named Volumes

```bash
# Create volume
docker volume create shared-data

# Container 1 writes data
docker run -v shared-data:/data writer-app

# Container 2 reads data
docker run -v shared-data:/data:ro reader-app
# :ro = read-only
```

#### Managing Named Volumes

```bash
# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect volume-name
docker volume inspect mysql-data

# Remove volume
docker volume rm volume-name

# Remove all unused volumes
docker volume prune

# Remove specific volumes
docker volume rm volume1 volume2 volume3
```

#### Volume Inspect Example

```bash
docker volume inspect mysql-data
```

Output:
```json
[
    {
        "CreatedAt": "2024-12-02T10:30:00Z",
        "Driver": "local",
        "Labels": {},
        "Mountpoint": "/var/lib/docker/volumes/mysql-data/_data",
        "Name": "mysql-data",
        "Options": {},
        "Scope": "local"
    }
]
```

---

### 3. Bind Mounts

**Characteristics:**
- Specific path on host filesystem
- Path is known and controlled by user
- Survives everything (user manages lifecycle)
- Can be shared across containers
- Real-time sync between host and container
- NOT visible in `docker volume ls`

#### Creating Bind Mounts

```bash
# Basic bind mount (absolute path required)
docker run -v /host/path:/container/path myapp

# Windows path
docker run -v C:\Users\user\project:/app node:18

# Linux/Mac path
docker run -v /home/user/project:/app node:18

# Current directory (pwd)
docker run -v $(pwd):/app node:18        # Linux/Mac
docker run -v ${PWD}:/app node:18        # PowerShell
```

#### Read-Only Bind Mounts

```bash
# Mount as read-only
docker run -v /host/path:/container/path:ro myapp

# Example: Read-only config
docker run -v /host/config:/etc/app/config:ro myapp
```

#### Development Workflow Example

```bash
# Live code reload during development
docker run -d \
  --name dev-server \
  -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  -e NODE_ENV=development \
  node:18 \
  npm run dev
```

**Explanation:**
- `-v $(pwd):/app` - Bind mount source code
- `-v /app/node_modules` - Anonymous volume to prevent overwriting
- Changes on host immediately reflect in container

#### Real-World Bind Mount Examples

```bash
# Web server with local content
docker run -d \
  --name nginx \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx

# Database with local data directory
docker run -d \
  --name postgres \
  -v /opt/postgres-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=secret \
  postgres:15

# Development environment
docker run -it \
  -v $(pwd):/workspace \
  -w /workspace \
  python:3.11 \
  bash

# Config file binding
docker run -d \
  --name app \
  -v /etc/app/config.yaml:/app/config.yaml:ro \
  myapp:latest
```

---

### Volume Comparison Example

```bash
# Anonymous volume
docker run -v /app/logs myapp
# Path: /var/lib/docker/volumes/random-id/_data
# Lifecycle: Removed with container (if --rm)

# Named volume
docker run -v app-logs:/app/logs myapp
# Path: /var/lib/docker/volumes/app-logs/_data
# Lifecycle: Persists independently

# Bind mount
docker run -v /home/user/logs:/app/logs myapp
# Path: /home/user/logs (known location)
# Lifecycle: User controlled
```

### Volume Management Commands

```bash
# List volumes (shows only named and anonymous, not bind mounts)
docker volume ls

# Create volume
docker volume create my-volume

# Inspect volume
docker volume inspect my-volume

# Remove volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune

# Remove volumes with filter
docker volume prune --filter "label!=keep"
```

### Why Bind Mounts Don't Appear in `docker volume ls`

Bind mounts are not managed by Docker's volume subsystem - they're direct filesystem mounts managed by the user. Docker only tracks volumes it manages (anonymous and named).

```bash
# This won't show bind mounts
docker volume ls

# To see all mounts (including bind mounts)
docker inspect container_name
# Look for "Mounts" section
```

### Volume Use Cases

| Scenario | Recommended Type |
|----------|------------------|
| Database data | Named Volume |
| Development code | Bind Mount |
| Temporary cache | Anonymous Volume |
| Configuration files | Bind Mount (read-only) |
| Log files (persistent) | Named Volume |
| Log files (development) | Bind Mount |
| Shared data between containers | Named Volume |
| node_modules in development | Anonymous Volume |

---

## Docker Ignore File

### What is .dockerignore?

`.dockerignore` is like `.gitignore` but for Docker. It specifies which files and directories should be excluded from the build context sent to the Docker daemon.

### Why Use .dockerignore?

1. **Faster Builds**: Smaller build context = faster transfer to Docker daemon
2. **Smaller Images**: Don't include unnecessary files in the image
3. **Security**: Exclude sensitive files (.env, secrets, credentials)
4. **Efficiency**: Avoid invalidating cache unnecessarily

### Creating .dockerignore

Create a file named `.dockerignore` in the same directory as your Dockerfile.

```plaintext
# .dockerignore

# Dependencies
node_modules
npm-debug.log
yarn-error.log
package-lock.json

# Testing
coverage
*.test.js
*.spec.js
__tests__

# Environment variables
.env
.env.local
.env.*.local

# Git
.git
.gitignore
.gitattributes

# Documentation
README.md
docs/
*.md

# IDE
.vscode
.idea
*.swp
*.swo
.DS_Store

# Build files
dist
build
*.log

# Docker files
Dockerfile
docker-compose.yml
.dockerignore

# CI/CD
.github
.gitlab-ci.yml
.travis.yml

# Temporary files
tmp/
temp/
*.tmp
```

### Pattern Syntax

```plaintext
# Comment

# Ignore specific file
secret.txt

# Ignore all files with extension
*.log
*.md

# Ignore directory
node_modules
dist/

# Ignore all files in directory
temp/**

# Exception (don't ignore)
!important.md

# Ignore files matching pattern
test/**/*.js
```

### Real-World Examples

#### Node.js Application

```plaintext
# .dockerignore for Node.js

node_modules
npm-debug.log
.npm
.env
.env.local
.git
.gitignore
README.md
.vscode
.idea
coverage
.nyc_output
dist
build
*.log
.DS_Store
```

#### Python Application

```plaintext
# .dockerignore for Python

__pycache__
*.pyc
*.pyo
*.pyd
.Python
*.so
*.egg
*.egg-info
dist
build
.env
.venv
venv/
ENV/
.git
.pytest_cache
.coverage
.mypy_cache
*.md
.vscode
```

#### React Application

```plaintext
# .dockerignore for React

node_modules
build
.git
.gitignore
README.md
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vscode
.idea
coverage
.DS_Store
```

### Example: Impact of .dockerignore

**Without .dockerignore:**
```bash
# Build context includes everything
Sending build context to Docker daemon  250MB
```

**With .dockerignore:**
```bash
# Build context excludes node_modules, .git, etc.
Sending build context to Docker daemon  2.5MB
```

### Testing .dockerignore

```bash
# Check what's being sent to Docker daemon
docker build --no-cache -t test .

# The first line shows the build context size
# Sending build context to Docker daemon  XX MB
```

### Advanced .dockerignore Patterns

```plaintext
# Ignore everything except specific files
*
!src/
!package.json
!package-lock.json

# Ignore all markdown except README
*.md
!README.md

# Ignore test files in any directory
**/*test.js
**/*spec.ts

# Ignore specific nested paths
**/temp/**
**/logs/**/*.log
```

---

**[PART 1 COMPLETE - This covers up to Docker Ignore File]**

**The documentation continues with:**
- Environment Variables & Arguments (ARG, ENV, --env, --env-file)
- Docker Networking (bridge, host, custom networks, container communication)
- MongoDB networking example
- Best Practices
- Common Commands Reference

**Type "continue" to proceed with Part 2 of the documentation.**  