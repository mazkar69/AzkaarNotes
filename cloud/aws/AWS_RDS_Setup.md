# AWS RDS - Relational Database Service Setup

> Last Updated: February 22, 2026

## Table of Contents
- [Overview](#overview)
- [Create RDS Instance (Console)](#create-rds-instance-console)
- [Connect to RDS](#connect-to-rds)
- [Security Group Configuration](#security-group-configuration)
- [Backup and Restore](#backup-and-restore)
- [AWS CLI Commands](#aws-cli-commands)

---

## Overview

RDS is a managed database service that handles provisioning, patching, backup, and scaling.

| Engine | Use Case |
|--------|----------|
| MySQL | General purpose, widely supported |
| PostgreSQL | Advanced features, JSON support |
| MariaDB | MySQL-compatible, open source |
| Aurora | AWS-optimized MySQL/PostgreSQL (high performance) |

### Free Tier

- `db.t3.micro` or `db.t4g.micro`
- 20 GB storage
- 750 hours per month (for 12 months)

---

## Create RDS Instance (Console)

```
RDS > Create Database

1. Engine: MySQL 8.0 (or PostgreSQL)
2. Template: Free Tier (for testing) or Production
3. Settings:
   - DB Instance Identifier: my-database
   - Master Username: admin
   - Master Password: your-secure-password
4. Instance Configuration:
   - Class: db.t3.micro (Free Tier)
5. Storage:
   - Type: gp3
   - Allocated: 20 GB
   - Enable storage autoscaling: Yes (Max 100 GB)
6. Connectivity:
   - VPC: Default
   - Public Access: Yes (for development) / No (for production)
   - Security Group: Create new or select existing
   - Port: 3306 (MySQL) or 5432 (PostgreSQL)
7. Database Authentication: Password
8. Additional Configuration:
   - Initial Database Name: mydb
   - Backup Retention: 7 days
   - Enable Enhanced Monitoring: Yes
9. Create Database
```

---

## Connect to RDS

### Get Endpoint

```
RDS > Databases > my-database > Connectivity & Security
Endpoint: my-database.abc123xyz.ap-south-1.rds.amazonaws.com
Port: 3306
```

### From Terminal (MySQL)

```bash
Syntax:- mysql -h <endpoint> -P <port> -u <username> -p
Example:- mysql -h my-database.abc123xyz.ap-south-1.rds.amazonaws.com -P 3306 -u admin -p
```

### From Terminal (PostgreSQL)

```bash
Syntax:- psql -h <endpoint> -p <port> -U <username> -d <database>
Example:- psql -h my-database.abc123xyz.ap-south-1.rds.amazonaws.com -p 5432 -U admin -d mydb
```

### From Node.js (MySQL)

```javascript
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,     // RDS endpoint
  port: process.env.DB_PORT,     // 3306
  user: process.env.DB_USER,     // admin
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default pool;
```

### From Node.js (PostgreSQL)

```javascript
import pg from "pg";

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,     // 5432
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  max: 10,
});

export default pool;
```

### Environment Variables

```env
DB_HOST=my-database.abc123xyz.ap-south-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASS=your-secure-password
DB_NAME=mydb
```

---

## Security Group Configuration

Create a security group that allows access only from your EC2 instance or your IP.

| Type | Protocol | Port | Source | Purpose |
|------|----------|------|--------|---------|
| MySQL/Aurora | TCP | 3306 | EC2 Security Group ID | App server access |
| MySQL/Aurora | TCP | 3306 | Your IP/32 | Local development |
| PostgreSQL | TCP | 5432 | EC2 Security Group ID | App server access |

Never open database ports to `0.0.0.0/0` in production.

---

## Backup and Restore

### Automated Backups

```
RDS > Databases > Modify
  - Backup Retention Period: 7 days (default)
  - Backup Window: Select preferred time
```

### Manual Snapshot

```bash
# Create snapshot
Syntax:- aws rds create-db-snapshot --db-instance-identifier <db-id> --db-snapshot-identifier <snapshot-name>
Example:- aws rds create-db-snapshot --db-instance-identifier my-database --db-snapshot-identifier my-db-backup-2026

# List snapshots
aws rds describe-db-snapshots --db-instance-identifier my-database --output table

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier my-restored-db --db-snapshot-identifier my-db-backup-2026

# Delete snapshot
aws rds delete-db-snapshot --db-snapshot-identifier my-db-backup-2026
```

---

## AWS CLI Commands

```bash
# List all RDS instances
aws rds describe-db-instances --query "DBInstances[].{ID:DBInstanceIdentifier,Engine:Engine,Status:DBInstanceStatus,Endpoint:Endpoint.Address}" --output table

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier my-database \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourPassword123 \
  --allocated-storage 20

# Stop instance (saves cost - max 7 days)
aws rds stop-db-instance --db-instance-identifier my-database

# Start instance
aws rds start-db-instance --db-instance-identifier my-database

# Delete instance
aws rds delete-db-instance --db-instance-identifier my-database --skip-final-snapshot

# Modify instance (e.g., change class)
aws rds modify-db-instance --db-instance-identifier my-database --db-instance-class db.t3.small --apply-immediately
```
