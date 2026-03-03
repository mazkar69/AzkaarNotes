# GitHub Actions — MongoDB Backup to AWS S3

Automate MongoDB database backups on a schedule and upload to S3 for safe storage.

---

## Table of Contents

- [Required GitHub Secrets](#required-github-secrets)
- [1. Quick Start — Daily Backup to S3](#1-quick-start--daily-backup-to-s3)
- [2. Backup with Retention (Auto-Delete Old Backups)](#2-backup-with-retention-auto-delete-old-backups)
- [3. Backup MongoDB Atlas (Remote DB)](#3-backup-mongodb-atlas-remote-db)

---

## Required GitHub Secrets

| Secret | Description | Example |
|--------|-------------|---------|
| `EC2_HOST` | EC2 public IP or domain | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/mydb` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/...` |
| `S3_BUCKET` | S3 bucket for backups | `my-db-backups` |

---

## 1. Quick Start — Daily Backup to S3

Runs daily at **3:00 AM UTC**. Takes a `mongodump`, compresses it, and uploads to S3.

```yaml
# .github/workflows/mongo-backup.yml

name: MongoDB Daily Backup

on:
  schedule:
    - cron: "0 3 * * *"   # Every day at 3:00 AM UTC
  workflow_dispatch:         # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Backup MongoDB via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
            BACKUP_DIR="/tmp/mongo-backup-$TIMESTAMP"
            ARCHIVE_NAME="mongo-backup-$TIMESTAMP.tar.gz"

            echo "📦 Creating MongoDB backup..."
            mongodump --uri="${{ secrets.MONGO_URI }}" --out="$BACKUP_DIR"

            echo "🗜️ Compressing backup..."
            tar -czf "/tmp/$ARCHIVE_NAME" -C /tmp "mongo-backup-$TIMESTAMP"

            echo "☁️ Uploading to S3..."
            aws s3 cp "/tmp/$ARCHIVE_NAME" "s3://${{ secrets.S3_BUCKET }}/mongodb-backups/$ARCHIVE_NAME"

            echo "🧹 Cleaning up local files..."
            rm -rf "$BACKUP_DIR" "/tmp/$ARCHIVE_NAME"

            echo "✅ Backup completed: $ARCHIVE_NAME"
```

> **Prerequisites on EC2:** `mongodump` (from `mongodb-database-tools`) and `aws cli` must be installed.

---

## 2. Backup with Retention (Auto-Delete Old Backups)

Same as above but **deletes backups older than 30 days** from S3 to manage storage costs.

```yaml
# .github/workflows/mongo-backup.yml

name: MongoDB Backup with Retention

on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Backup and cleanup old backups
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -e

            TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
            DB_NAME="mydb"
            BACKUP_DIR="/tmp/mongo-backup-$TIMESTAMP"
            ARCHIVE_NAME="$DB_NAME-$TIMESTAMP.tar.gz"
            S3_PATH="s3://${{ secrets.S3_BUCKET }}/mongodb-backups"

            # Create backup
            mongodump --uri="${{ secrets.MONGO_URI }}" --out="$BACKUP_DIR"

            # Compress
            tar -czf "/tmp/$ARCHIVE_NAME" -C /tmp "mongo-backup-$TIMESTAMP"

            # Upload to S3
            aws s3 cp "/tmp/$ARCHIVE_NAME" "$S3_PATH/$ARCHIVE_NAME"

            # Delete backups older than 30 days from S3
            aws s3 ls "$S3_PATH/" | while read -r line; do
              FILE_DATE=$(echo "$line" | awk '{print $1}')
              FILE_NAME=$(echo "$line" | awk '{print $4}')
              if [ -n "$FILE_NAME" ]; then
                FILE_AGE=$(( ($(date +%s) - $(date -d "$FILE_DATE" +%s)) / 86400 ))
                if [ "$FILE_AGE" -gt 30 ]; then
                  echo "🗑️ Deleting old backup: $FILE_NAME ($FILE_AGE days old)"
                  aws s3 rm "$S3_PATH/$FILE_NAME"
                fi
              fi
            done

            # Cleanup
            rm -rf "$BACKUP_DIR" "/tmp/$ARCHIVE_NAME"

            echo "✅ Backup + retention cleanup completed!"
```

> **Alternative:** Use S3 Lifecycle Rules to auto-delete old objects instead of doing it in the script.
> Go to **S3 → Bucket → Management → Lifecycle rules → Add rule → Expiration: 30 days**.

---

## 3. Backup MongoDB Atlas (Remote DB)

If using **MongoDB Atlas**, run `mongodump` directly from the GitHub runner (no EC2 needed).

```yaml
# .github/workflows/mongo-backup.yml

name: MongoDB Atlas Backup to S3

on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest

    steps:
      - name: Install MongoDB tools
        run: |
          wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg
          echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
          sudo apt-get update
          sudo apt-get install -y mongodb-database-tools

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Dump MongoDB Atlas
        run: |
          TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
          mongodump --uri="${{ secrets.MONGO_URI }}" --out="./backup-$TIMESTAMP"
          tar -czf "backup-$TIMESTAMP.tar.gz" "backup-$TIMESTAMP"

      - name: Upload to S3
        run: |
          TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
          ARCHIVE=$(ls backup-*.tar.gz)
          aws s3 cp "$ARCHIVE" "s3://${{ secrets.S3_BUCKET }}/mongodb-backups/$ARCHIVE"

      - name: Verify upload
        run: aws s3 ls "s3://${{ secrets.S3_BUCKET }}/mongodb-backups/" --human-readable | tail -5
```

> **Note:** Make sure your Atlas cluster allows connections from GitHub Actions runner IPs, or whitelist `0.0.0.0/0` in Atlas Network Access (only for backup user with read-only permissions).
