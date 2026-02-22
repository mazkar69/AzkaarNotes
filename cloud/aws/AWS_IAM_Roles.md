# AWS IAM - Users, Roles and Policies

> Last Updated: February 22, 2026

## Table of Contents
- [IAM Overview](#iam-overview)
- [IAM Users](#iam-users)
- [IAM Groups](#iam-groups)
- [IAM Policies](#iam-policies)
- [IAM Roles](#iam-roles)
- [Best Practices](#best-practices)

---

## IAM Overview

IAM (Identity and Access Management) controls who can access what in your AWS account.

| Component | Description |
|-----------|-------------|
| User | A person or application that interacts with AWS |
| Group | Collection of users with shared permissions |
| Policy | JSON document defining permissions |
| Role | Set of permissions that can be assumed by users, services, or applications |

---

## IAM Users

### Create User (AWS CLI)

```bash
# Create a new user
aws iam create-user --user-name deploy-user

# Create access keys for programmatic access
aws iam create-access-key --user-name deploy-user

# Add user to a group
aws iam add-user-to-group --user-name deploy-user --group-name developers

# List all users
aws iam list-users --output table

# Delete a user
aws iam delete-user --user-name deploy-user
```

### Create User (Console)

```
IAM > Users > Add Users
  - Enter username
  - Select access type: Console / Programmatic / Both
  - Attach policies or add to group
  - Review and create
```

---

## IAM Groups

Groups let you manage permissions for multiple users at once.

```bash
# Create a group
aws iam create-group --group-name developers

# Attach policy to group
aws iam attach-group-policy --group-name developers --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# List groups
aws iam list-groups --output table

# List users in a group
aws iam get-group --group-name developers
```

### Common Group Structure

| Group | Policies | Purpose |
|-------|----------|---------|
| `admins` | AdministratorAccess | Full AWS access |
| `developers` | S3, EC2, CloudWatch, Lambda | Development resources |
| `readonly` | ReadOnlyAccess | View-only access |
| `deployers` | EC2, S3, CodeDeploy | Deployment automation |

---

## IAM Policies

### Policy Structure

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/*"
    }
  ]
}
```

### Key Fields

| Field | Description |
|-------|-------------|
| `Effect` | `Allow` or `Deny` |
| `Action` | AWS API actions (e.g., `s3:GetObject`) |
| `Resource` | ARN of the resource |
| `Condition` | Optional conditions (IP, time, MFA) |

### Common AWS Managed Policies

| Policy | Description |
|--------|-------------|
| `AdministratorAccess` | Full access to all AWS services |
| `AmazonS3FullAccess` | Full S3 access |
| `AmazonS3ReadOnlyAccess` | Read-only S3 access |
| `AmazonEC2FullAccess` | Full EC2 access |
| `CloudWatchFullAccess` | Full CloudWatch access |
| `AmazonRDSFullAccess` | Full RDS access |

### Custom Policy Example - S3 Bucket Access

```bash
# Create custom policy from JSON file
aws iam create-policy --policy-name S3BucketAccess --policy-document file://s3-policy.json

# Attach custom policy to user
aws iam attach-user-policy --user-name deploy-user --policy-arn arn:aws:iam::123456789:policy/S3BucketAccess
```

---

## IAM Roles

Roles are used when AWS services need to access other AWS services.

### Common Use Cases

| Role For | Example |
|----------|---------|
| EC2 | EC2 instance accessing S3 buckets |
| Lambda | Lambda function reading from DynamoDB |
| ECS | Container accessing CloudWatch logs |
| External | Cross-account access |

### Create Role for EC2 (Console)

```
IAM > Roles > Create Role
  - Trusted entity: AWS Service
  - Use case: EC2
  - Attach policies: AmazonS3ReadOnlyAccess
  - Name: EC2-S3-ReadOnly
  - Create
```

### Attach Role to EC2

```
EC2 > Instance > Actions > Security > Modify IAM Role
  - Select role: EC2-S3-ReadOnly
  - Update
```

After attaching a role to EC2, your application can access S3 without hardcoding credentials:

```javascript
// No credentials needed - uses IAM role automatically
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: "ap-south-1" });
// SDK automatically uses the EC2 instance role credentials
```

### Create Role (CLI)

```bash
# Create trust policy file (trust-policy.json)
# Then create role
aws iam create-role --role-name EC2-S3-Access --assume-role-policy-document file://trust-policy.json

# Attach policy to role
aws iam attach-role-policy --role-name EC2-S3-Access --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

# Create instance profile and add role
aws iam create-instance-profile --instance-profile-name EC2-S3-Profile
aws iam add-role-to-instance-profile --instance-profile-name EC2-S3-Profile --role-name EC2-S3-Access
```

Trust Policy for EC2:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

## Best Practices

1. Never use the root account for daily tasks
2. Enable MFA on root and all IAM users
3. Use groups to assign permissions, not individual users
4. Follow the principle of least privilege - grant only what is needed
5. Use IAM roles for applications running on AWS services (EC2, Lambda)
6. Never hardcode access keys in code - use environment variables or IAM roles
7. Rotate access keys regularly
8. Use AWS Organizations for managing multiple accounts
9. Review IAM policies periodically with IAM Access Analyzer
10. Use conditions in policies to restrict by IP, time, or MFA
