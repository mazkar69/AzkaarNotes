# GitHub Actions — Next.js Deploy to AWS EC2

Deploy a Next.js application (SSR / SSG) to an AWS EC2 instance using GitHub Actions with PM2.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — SSH Pull + PM2 Restart](#1-quick-start--ssh-pull--pm2-restart)
- [2. Build on Runner + SCP Standalone Deploy](#2-build-on-runner--scp-standalone-deploy)
- [3. Multi-Environment Deploy (Staging + Production)](#3-multi-environment-deploy-staging--production)
- [4. Deploy with Docker](#4-deploy-with-docker)
- [5. Deploy to Vercel (Zero Config)](#5-deploy-to-vercel-zero-config)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (PEM content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `APP_DIR` | Application directory on server | `/var/www/my-nextjs-app` |
| `VERCEL_TOKEN` | Vercel deploy token (for Vercel deploy) | `prj_xxxx` |
| `VERCEL_ORG_ID` | Vercel organization ID | `team_xxxx` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `prj_xxxx` |

---

## 1. Quick Start — SSH Pull + PM2 Restart

Simple approach — SSH into EC2, pull code, build on server, restart PM2.

```yaml
# .github/workflows/deploy.yml

name: Deploy Next.js to EC2

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
            cd /var/www/my-nextjs-app

            git fetch origin
            git reset --hard origin/main

            export NVM_DIR="$HOME/.nvm"
            source $NVM_DIR/nvm.sh

            npm ci
            npm run build

            pm2 reload my-nextjs-app --update-env || pm2 start npm --name "my-nextjs-app" -- start
            pm2 save

            echo "✅ Next.js deployed!"
```

> **Note:** Building on the server uses server resources. For low-spec EC2 instances, prefer [Option 2](#2-build-on-runner--scp-standalone-deploy).

---

## 2. Build on Runner + SCP Standalone Deploy

Build on GitHub runner using Next.js `standalone` output, then SCP to EC2. Best for **low-resource servers**.

**Step 1:** Enable standalone output in `next.config.js`:

```js
// next.config.js
module.exports = {
  output: "standalone",
};
```

**Step 2:** Workflow file:

```yaml
# .github/workflows/deploy.yml

name: Deploy Next.js (Standalone)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build Next.js (standalone)
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Prepare standalone package
        run: |
          # Copy static files and public folder into standalone
          cp -r .next/static .next/standalone/.next/static
          cp -r public .next/standalone/public

      - name: Remove old build on server
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            rm -rf /var/www/my-nextjs-app/*

      - name: Upload standalone build
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: ".next/standalone/*"
          target: "/var/www/my-nextjs-app"
          strip_components: 2

      - name: Restart PM2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/my-nextjs-app
            pm2 reload my-nextjs-app --update-env || pm2 start server.js --name "my-nextjs-app"
            pm2 save
            echo "✅ Standalone Next.js deployed!"
```

---

## 3. Multi-Environment Deploy (Staging + Production)

Deploy `development` → staging, `main`/`master` → production with environment-specific variables.

```yaml
# .github/workflows/deploy.yml

name: Deploy Next.js — Multi-Env

on:
  push:
    branches: [master, development]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: "Select environment"
        required: true
        default: "staging"
        type: choice
        options:
          - staging
          - production

jobs:
  # ─── Staging Deploy ───
  deploy-staging:
    if: github.ref == 'refs/heads/development'
    runs-on: ubuntu-latest
    environment: development

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install & Build
        run: |
          npm ci
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Staging
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: ".next/,public/,package.json,next.config.*"
          target: "/var/www/my-nextjs-staging"

      - name: Restart Staging PM2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/my-nextjs-staging
            export NVM_DIR="$HOME/.nvm" && source $NVM_DIR/nvm.sh
            npm ci --omit=dev
            pm2 reload my-nextjs-staging --update-env || pm2 start npm --name "my-nextjs-staging" -- start
            pm2 save

  # ─── Production Deploy ───
  deploy-production:
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    environment: master

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install & Build
        run: |
          npm ci
          npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}

      - name: Deploy to Production
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: ".next/,public/,package.json,next.config.*"
          target: "/var/www/my-nextjs-app"

      - name: Restart Production PM2
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /var/www/my-nextjs-app
            export NVM_DIR="$HOME/.nvm" && source $NVM_DIR/nvm.sh
            npm ci --omit=dev
            pm2 reload my-nextjs-app --update-env || pm2 start npm --name "my-nextjs-app" -- start
            pm2 save
```

---

## 4. Deploy with Docker

Build a Docker image on the server and deploy Next.js in a container.

```yaml
# .github/workflows/deploy-docker.yml

name: Deploy Next.js (Docker)

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
            cd /var/www/my-nextjs-app

            git fetch origin
            git reset --hard origin/main

            # Build and restart container
            docker compose down
            docker compose build --no-cache
            docker compose up -d

            # Cleanup old images
            docker image prune -f

            echo "✅ Next.js Docker deployment completed!"
```

Requires a `docker-compose.yml` in your project:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
```

---

## 5. Deploy to Vercel (Zero Config)

If you use **Vercel** for hosting — no EC2 needed. Auto-deploys on push, or use manual trigger.

```yaml
# .github/workflows/deploy-vercel.yml

name: Deploy to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Vercel CLI
        run: npm i -g vercel

      - name: Pull Vercel environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy to Production
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

> **Setup:** Run `vercel link` locally first to get `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`, then add them as GitHub secrets.