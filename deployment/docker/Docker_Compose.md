# Docker Compose - Multi-Container Applications

> Last Updated: February 22, 2026

## Table of Contents
- [What is Docker Compose](#what-is-docker-compose)
- [Installation](#installation)
- [Basic Structure](#basic-structure)
- [Common Commands](#common-commands)
- [Node.js + MongoDB + Redis](#nodejs--mongodb--redis)
- [Laravel + MySQL + phpMyAdmin](#laravel--mysql--phpmyadmin)
- [Networking](#networking)
- [Volumes](#volumes)
- [Environment Variables](#environment-variables)
- [Production Tips](#production-tips)

---

## What is Docker Compose

Docker Compose lets you define and run multi-container applications with a single YAML file. Instead of running multiple `docker run` commands, you define everything in `docker-compose.yml`.

---

## Installation

Docker Compose v2 comes bundled with Docker Desktop and Docker Engine.

```bash
# Check version
docker compose version

# If not installed (Linux)
sudo apt update
sudo apt install docker-compose-plugin

# Verify
docker compose version
```

---

## Basic Structure

```yaml
# docker-compose.yml
services:
  service-name:
    image: image-name:tag          # Use existing image
    # OR
    build: ./path-to-dockerfile    # Build from Dockerfile
    ports:
      - "host:container"
    environment:
      - KEY=value
    volumes:
      - host-path:container-path
    depends_on:
      - other-service
    restart: unless-stopped
```

---

## Common Commands

```bash
# Start all services (detached)
docker compose up -d

# Start and rebuild images
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs
docker compose logs -f service-name     # Follow specific service

# List running containers
docker compose ps

# Execute command in running container
docker compose exec service-name bash

# Restart a service
docker compose restart service-name

# Stop a specific service
docker compose stop service-name

# Start a specific service
docker compose start service-name

# Build without starting
docker compose build

# Pull latest images
docker compose pull

# Scale a service
docker compose up -d --scale worker=3
```

---

## Node.js + MongoDB + Redis

### Project Structure

```
project/
├── docker-compose.yml
├── Dockerfile
├── .env
├── .dockerignore
├── package.json
└── src/
    └── server.js
```

### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

### .dockerignore

```
node_modules
.git
.env
npm-debug.log
```

### docker-compose.yml

```yaml
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=mongodb://mongo:27017/mydb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password123
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --requirepass yourpassword
    restart: unless-stopped

volumes:
  mongo-data:
  redis-data:
```

---

## Laravel + MySQL + phpMyAdmin

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - .:/var/www/html
    depends_on:
      - mysql
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=laravel
      - DB_USERNAME=root
      - DB_PASSWORD=rootpassword

  mysql:
    image: mysql:8
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=laravel
    restart: unless-stopped

  phpmyadmin:
    image: phpmyadmin:latest
    ports:
      - "8080:80"
    environment:
      - PMA_HOST=mysql
      - PMA_PORT=3306
      - MYSQL_ROOT_PASSWORD=rootpassword
    depends_on:
      - mysql

volumes:
  mysql-data:
```

---

## Networking

By default, Docker Compose creates a network for all services. Services can communicate using their service names as hostnames.

```yaml
services:
  app:
    image: node:20-alpine
    # Connect to mongo using hostname "mongo" (service name)
    # MONGO_URI=mongodb://mongo:27017/mydb

  mongo:
    image: mongo:7
    # Accessible at hostname "mongo" within the network
```

### Custom Networks

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  api:
    networks:
      - backend

  db:
    networks:
      - backend

networks:
  frontend:
  backend:
```

---

## Volumes

### Named Volumes (Persistent)

```yaml
services:
  db:
    volumes:
      - db-data:/var/lib/mysql     # Named volume

volumes:
  db-data:                          # Declare named volume
```

### Bind Mounts (Development)

```yaml
services:
  app:
    volumes:
      - ./src:/app/src              # Sync local code with container
      - /app/node_modules           # Prevent overwriting node_modules
```

### Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect volume-name

# Remove unused volumes
docker volume prune
```

---

## Environment Variables

### Inline

```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - PORT=5000
```

### From .env File

```yaml
services:
  app:
    env_file:
      - .env
```

### Variable Substitution

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:${TAG:-latest}
    ports:
      - "${PORT:-3000}:3000"
```

```env
# .env (automatically loaded by docker compose)
TAG=v1.2.0
PORT=5000
```

---

## Production Tips

### Health Checks

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

### Resource Limits

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
        reservations:
          memory: 256M
```

### Restart Policies

```yaml
services:
  app:
    restart: unless-stopped
    # Options: no, always, on-failure, unless-stopped
```

### Logging

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Override Files

Use `docker-compose.override.yml` for development settings (loaded automatically):

```yaml
# docker-compose.yml (base - production)
services:
  app:
    image: myapp:latest
    restart: always

# docker-compose.override.yml (development - auto-loaded)
services:
  app:
    build: .
    volumes:
      - ./src:/app/src
    environment:
      - NODE_ENV=development
```

```bash
# Development (loads both files automatically)
docker compose up

# Production (ignore override)
docker compose -f docker-compose.yml up -d
```
