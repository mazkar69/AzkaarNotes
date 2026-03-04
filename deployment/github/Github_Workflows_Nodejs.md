# GitHub Actions — Node.js / Express Deploy to AWS EC2

Deploy a Node.js backend (Express, Fastify, etc.) to an AWS EC2 instance using GitHub Actions with SSH.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — Basic SSH Deploy with PM2](#1-quick-start--basic-ssh-deploy-with-pm2)
- [2. SSH Deploy with NVM + Environment Logs](#2-ssh-deploy-with-nvm--environment-logs)
- [3. Multi-Environment Deploy (Staging + Production)](#3-multi-environment-deploy-staging--production)
- [4. Deploy with Health Check + Rollback](#4-deploy-with-health-check--rollback)
- [5. Deploy with Slack Notification](#5-deploy-with-slack-notification)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (PEM content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `EC2_PORT` | SSH port (optional, defaults to 22) | `22` |
| `APP_DIR` | Application directory on server | `/var/www/my-app` |
| `SLACK_WEBHOOK_URL` | Slack webhook (optional, for notifications) | `https://hooks.slack.com/...` |

> **Tip:** Go to **Repository → Settings → Secrets and variables → Actions → New repository secret** to add secrets.

---

## 1. Quick Start — Basic SSH Deploy with PM2

The simplest workflow — SSH into EC2, pull latest code, install deps, restart PM2.

```yaml
# .github/workflows/deploy.yml

name: Deploy Node.js to EC2

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

            # Load NVM and use Node 22
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            npm ci --omit=dev

            pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            echo "✅ Deployment completed!"
```

---

## 2. SSH Deploy with NVM + Environment Logs

When using **NVM** on the server and you want deploy logs for debugging.

```yaml
# .github/workflows/deploy.yml

name: Deploy to AWS EC2

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Starting deployment
        run: |
          echo "🚀 Starting deployment to AWS EC2..."
          echo "EC2_HOST: ${{ secrets.EC2_HOST }}"
          echo "EC2_USER: ${{ secrets.EC2_USER }}"
          echo "EC2_PORT: ${{ secrets.EC2_PORT || 22 }}"
          echo "APP_DIR: ${{ secrets.APP_DIR }}"

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          port: ${{ secrets.EC2_PORT || 22 }}
          script: |
            set -e

            echo "📂 Navigating to application directory..."
            cd ${{ secrets.APP_DIR }}

            echo "⬇️ Pulling latest code from GitHub..."
            git fetch origin
            git reset --hard origin/main

            echo "🔧 Setting up Node.js environment..."
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            echo "📦 Installing dependencies..."
            npm ci --omit=dev

            echo "♻️ Reloading PM2 process..."
            pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            echo "✅ Deployment completed successfully!"
```

---

## 3. Multi-Environment Deploy (Staging + Production)

Deploy to **staging** from `development` branch and **production** from `main` branch.

```yaml
# .github/workflows/deploy.yml

name: Deploy Node.js API

on:
  push:
    branches: [main, development]
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
    environment: staging

    steps:
      - name: Deploy to Staging
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app-staging

            git fetch origin
            git reset --hard origin/development

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            npm ci --omit=dev
            pm2 reload my-app-staging --update-env || pm2 start ecosystem.config.cjs --env staging
            pm2 save

            echo "✅ Staging deployment completed!"

  # ─── Production Deploy ───
  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy to Production
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

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            npm ci --omit=dev
            pm2 reload my-app --update-env || pm2 start ecosystem.config.cjs --env production
            pm2 save

            echo "✅ Production deployment completed!"
```

---

## 4. Deploy with Health Check + Rollback

After deploying, hit a health endpoint. If it fails, **rollback** to the previous commit.

```yaml
# .github/workflows/deploy.yml

name: Deploy with Health Check

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy and Verify
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e
            cd /var/www/my-app

            # Save current commit for rollback
            PREVIOUS_COMMIT=$(git rev-parse HEAD)

            git fetch origin
            git reset --hard origin/main

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            npm ci --omit=dev
            pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
            pm2 save

            # Wait for app to start
            sleep 5

            # Health check
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)

            if [ "$HTTP_STATUS" != "200" ]; then
              echo "❌ Health check failed (HTTP $HTTP_STATUS). Rolling back..."
              git reset --hard $PREVIOUS_COMMIT
              npm ci --omit=dev
              pm2 reload ecosystem.config.cjs --update-env
              pm2 save
              command -v pm2
              echo "⏪ Rolled back to $PREVIOUS_COMMIT"
              exit 1
            fi

            echo "✅ Health check passed! Deployment successful."
```

> **Note:** Make sure your app has a `GET /api/health` endpoint that returns `200 OK`.

---

## 5. Deploy with Slack Notification

Get notified on Slack when deployment succeeds or fails.

```yaml
# .github/workflows/deploy.yml

name: Deploy + Notify

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Deploy via SSH
        id: deploy
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

            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
            nvm use 22

            command -v node
            command -v pm2

            npm ci --omit=dev
            pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
            pm2 save

      - name: Notify Slack — Success
        if: success()
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "✅ *${{ github.repository }}* deployed successfully!\nBranch: `${{ github.ref_name }}`\nCommit: `${{ github.sha }}` by ${{ github.actor }}"
            }

      - name: Notify Slack — Failure
        if: failure()
        uses: slackapi/slack-github-action@v2.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            {
              "text": "❌ *${{ github.repository }}* deployment FAILED!\nBranch: `${{ github.ref_name }}`\nCommit: `${{ github.sha }}` by ${{ github.actor }}\nCheck: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
```

> **Setup:** Create a Slack Incoming Webhook at [api.slack.com/apps](https://api.slack.com/apps) and add the URL as `SLACK_WEBHOOK_URL` secret.