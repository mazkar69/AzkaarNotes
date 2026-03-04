# GitHub Actions — Monorepo Deploy (Frontend + Backend)

Deploy both frontend and backend from a single monorepo with conditional workflows based on changed files.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — Deploy Changed Services Only](#1-quick-start--deploy-changed-services-only)
- [2. Full Monorepo — Build Both + Deploy](#2-full-monorepo--build-both--deploy)
- [3. Monorepo with Shared CI + Separate Deploy](#3-monorepo-with-shared-ci--separate-deploy)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

---

## Monorepo Structure

```
my-app/
├── client/          # React / Next.js frontend
│   ├── package.json
│   └── src/
├── server/          # Node.js / Express backend
│   ├── package.json
│   └── src/
└── .github/
    └── workflows/
```

---

## 1. Quick Start — Deploy Changed Services Only

Only deploy the service that has changed files — saves time and resources.

```yaml
# .github/workflows/deploy.yml

name: Deploy Monorepo

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  # ─── Detect changes ───
  changes:
    runs-on: ubuntu-latest
    outputs:
      client: ${{ steps.filter.outputs.client }}
      server: ${{ steps.filter.outputs.server }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            client:
              - 'client/**'
            server:
              - 'server/**'

  # ─── Deploy Frontend ───
  deploy-client:
    needs: changes
    if: needs.changes.outputs.client == 'true'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
          cache-dependency-path: client/package-lock.json

      - name: Build frontend
        run: |
          cd client
          npm ci
          npm run build

      - name: Deploy frontend to EC2
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "client/dist/*"
          target: "/var/www/my-app-frontend"
          strip_components: 2

  # ─── Deploy Backend ───
  deploy-server:
    needs: changes
    if: needs.changes.outputs.server == 'true'
    runs-on: ubuntu-latest

    steps:
      - name: Deploy backend via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app-backend

            git fetch origin
            git reset --hard origin/main

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            cd server
            npm ci --omit=dev

            pm2 reload my-app-api --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            echo "✅ Backend deployed!"
```

---

## 2. Full Monorepo — Build Both + Deploy

Always build and deploy both frontend and backend on every push to `main`.

```yaml
# .github/workflows/deploy.yml

name: Deploy Full Stack

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
          cache-dependency-path: client/package-lock.json

      - name: Build frontend
        run: |
          cd client
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}

      - name: Deploy to EC2
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "client/dist/*"
          target: "/var/www/my-app-frontend"
          strip_components: 2

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy backend
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app-backend

            git fetch origin
            git reset --hard origin/main

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            cd server
            npm ci --omit=dev

            pm2 reload my-app-api --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            echo "✅ Backend deployed!"

      - name: Restart Nginx
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: sudo systemctl restart nginx
```

---

## 3. Monorepo with Shared CI + Separate Deploy

Run linting and tests first, then deploy only if CI passes.

```yaml
# .github/workflows/deploy.yml

name: CI + Deploy Monorepo

on:
  push:
    branches: [main]

jobs:
  # ─── CI: Lint & Test ───
  ci-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
          cache-dependency-path: client/package-lock.json
      - run: cd client && npm ci
      - run: cd client && npm run lint
      - run: cd client && npm test

  ci-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
          cache-dependency-path: server/package-lock.json
      - run: cd server && npm ci
      - run: cd server && npm run lint
      - run: cd server && npm test

  # ─── Deploy after CI passes ───
  deploy:
    needs: [ci-client, ci-server]
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"
          cache-dependency-path: client/package-lock.json

      - name: Build frontend
        run: |
          cd client
          npm ci
          npm run build

      - name: Deploy frontend
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "client/dist/*"
          target: "/var/www/my-app-frontend"
          strip_components: 2

      - name: Deploy backend + restart services
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app-backend

            git fetch origin
            git reset --hard origin/main

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            cd server
            npm ci --omit=dev

            pm2 reload my-app-api --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            sudo systemctl restart nginx
            echo "✅ Full stack deployed!"
```
