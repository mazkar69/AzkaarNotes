# GitHub Actions — React (Vite / CRA) Deploy to AWS EC2

Deploy a React frontend (Vite or Create React App) to an AWS EC2 instance served by Nginx or Apache.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — Build + SCP to EC2](#1-quick-start--build--scp-to-ec2)
- [2. Build with Cache + SCP Deploy](#2-build-with-cache--scp-deploy)
- [3. Multi-Environment Deploy (Staging + Production)](#3-multi-environment-deploy-staging--production)
- [4. Deploy to AWS S3 + CloudFront](#4-deploy-to-aws-s3--cloudfront)
- [5. Build + Deploy with Nginx Cache Clear](#5-build--deploy-with-nginx-cache-clear)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (PEM content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `APP_DIR` | Deploy target directory on server | `/var/www/my-react-app` |
| `AWS_ACCESS_KEY_ID` | AWS access key (for S3 deploy) | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (for S3 deploy) | `wJalrXUtnFEMI/K7MDENG/...` |
| `S3_BUCKET` | S3 bucket name (for S3 deploy) | `my-react-app-bucket` |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront ID (for invalidation) | `E1A2B3C4D5` |

---

## 1. Quick Start — Build + SCP to EC2

The simplest workflow — build locally on GitHub runner, then SCP the `dist/` folder to EC2.

```yaml
# .github/workflows/deploy.yml

name: Deploy React to EC2

on:
  push:
    branches: [main]
  workflow_dispatch:

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

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build

      - name: Copy build to EC2
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/my-react-app"

      - name: Restart Nginx
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: sudo systemctl restart nginx
```

---

## 2. Build with Cache + SCP Deploy

Use **npm cache** to speed up dependency installation across runs.

```yaml
# .github/workflows/deploy.yml

name: Deploy React (Cached)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js with cache
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}

      - name: Clean old files & deploy
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            rm -rf /var/www/my-react-app/*

      - name: Upload build to EC2
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/my-react-app"
          strip_components: 1
```

> **Tip:** Set `VITE_API_URL` in **Repository → Settings → Variables → Actions** (not Secrets) since it's not sensitive.

---

## 3. Multi-Environment Deploy (Staging + Production)

Deploy to **staging** from `development` branch and **production** from `main`/`master` branch.

```yaml
# .github/workflows/deploy.yml

name: Deploy React — Multi-Env

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
          VITE_API_URL: ${{ vars.VITE_API_URL }}

      - name: Deploy to Staging Server
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/"
          target: "/var/www/my-app-staging"
          strip_components: 1

  # ─── Production Deploy ───
  deploy-production:
    if: github.ref == 'refs/heads/main'
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

      - name: Install & Build
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}

      - name: Deploy to Production Server
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/"
          target: "/var/www/my-app"
          strip_components: 1
```

---

## 4. Deploy to AWS S3 + CloudFront

Host React app on **S3** with **CloudFront** CDN — no EC2 needed.

```yaml
# .github/workflows/deploy-s3.yml

name: Deploy React to S3 + CloudFront

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
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

      - name: Install & Build
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: ${{ vars.VITE_API_URL }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Sync to S3
        run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete

      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

> **Note:** The `--delete` flag removes files from S3 that are no longer in the build output.

---

## 5. Build + Deploy with Nginx Cache Clear

Clear Nginx cache after deploying new files so users get the latest build immediately.

```yaml
# .github/workflows/deploy.yml

name: Deploy React + Clear Cache

on:
  push:
    branches: [main]
  workflow_dispatch:

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
          cache: "npm"

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Upload build to EC2
        uses: appleboy/scp-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          source: "dist/*"
          target: "/var/www/my-react-app"
          strip_components: 1

      - name: Clear cache & restart Nginx
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            # Clear Nginx proxy cache (if configured)
            sudo rm -rf /var/cache/nginx/*

            # Test config & restart
            sudo nginx -t && sudo systemctl restart nginx

            echo "✅ React app deployed and Nginx cache cleared!"
```