# GitHub Actions — Docker Build & Deploy

Build Docker images and deploy containerized apps to EC2 or Docker Hub.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — Build & Deploy on EC2 via SSH](#1-quick-start--build--deploy-on-ec2-via-ssh)
- [2. Build + Push to Docker Hub + Deploy](#2-build--push-to-docker-hub--deploy)
- [3. Docker Compose — Multi-Container Deploy](#3-docker-compose--multi-container-deploy)
- [4. Build + Push to GitHub Container Registry (GHCR)](#4-build--push-to-github-container-registry-ghcr)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (PEM content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOCKERHUB_USERNAME` | Docker Hub username | `myusername` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_xxxx` |

---

## 1. Quick Start — Build & Deploy on EC2 via SSH

SSH into EC2, pull code, build image, and run container directly on the server.

```yaml
# .github/workflows/deploy.yml

name: Docker Deploy to EC2

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app

            git fetch origin
            git reset --hard origin/main

            # Stop existing container
            docker compose down

            # Rebuild and start
            docker compose up -d --build

            # Cleanup old images
            docker image prune -f

            echo "✅ Docker deployment completed!"
```

---

## 2. Build + Push to Docker Hub + Deploy

Build image on GitHub runner, push to Docker Hub, then pull and run on EC2.

```yaml
# .github/workflows/deploy.yml

name: Build, Push & Deploy Docker

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/my-app:latest
            ${{ secrets.DOCKERHUB_USERNAME }}/my-app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            # Pull latest image
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/my-app:latest

            # Stop and remove old container
            docker stop my-app || true
            docker rm my-app || true

            # Run new container
            docker run -d \
              --name my-app \
              --restart unless-stopped \
              -p 5000:5000 \
              --env-file /var/www/my-app/.env \
              ${{ secrets.DOCKERHUB_USERNAME }}/my-app:latest

            # Cleanup old images
            docker image prune -f

            echo "✅ Docker deploy from Docker Hub completed!"
```

> **Tip:** The `cache-from` and `cache-to` options use GitHub Actions cache to speed up subsequent builds.

---

## 3. Docker Compose — Multi-Container Deploy

Deploy a full stack with Docker Compose (e.g., Node.js API + MongoDB + Redis).

```yaml
# .github/workflows/deploy.yml

name: Deploy Docker Compose Stack

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy full stack via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app

            git fetch origin
            git reset --hard origin/main

            # Pull latest images and rebuild
            docker compose pull
            docker compose up -d --build --remove-orphans

            # Show running containers
            docker compose ps

            # Cleanup
            docker image prune -f
            docker volume prune -f

            echo "✅ Docker Compose stack deployed!"
```

Example `docker-compose.yml` for a MERN stack:

```yaml
# docker-compose.yml

services:
  api:
    build: .
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  mongo_data:
```

---

## 4. Build + Push to GitHub Container Registry (GHCR)

Use GitHub's own container registry instead of Docker Hub — free for public repos.

```yaml
# .github/workflows/deploy.yml

name: Build & Push to GHCR

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=raw,value=latest

      - name: Build and push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest

    steps:
      - name: Deploy to EC2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            # Login to GHCR
            echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u ${{ github.actor }} --password-stdin

            # Pull and restart
            docker pull ghcr.io/${{ github.repository }}:latest
            docker stop my-app || true
            docker rm my-app || true
            docker run -d \
              --name my-app \
              --restart unless-stopped \
              -p 5000:5000 \
              --env-file /var/www/my-app/.env \
              ghcr.io/${{ github.repository }}:latest

            docker image prune -f
            echo "✅ GHCR deployment completed!"
```

> **Note:** GHCR uses `GITHUB_TOKEN` automatically — no extra secrets needed for pushing images.
