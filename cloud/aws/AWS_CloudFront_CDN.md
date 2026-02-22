# AWS CloudFront CDN Setup

> Last Updated: February 22, 2026

## Table of Contents
- [What is CloudFront](#what-is-cloudfront)
- [Create Distribution (Console)](#create-distribution-console)
- [CloudFront with S3](#cloudfront-with-s3)
- [CloudFront with EC2/Load Balancer](#cloudfront-with-ec2load-balancer)
- [Custom Domain with SSL](#custom-domain-with-ssl)
- [Cache Invalidation](#cache-invalidation)
- [AWS CLI Commands](#aws-cli-commands)

---

## What is CloudFront

CloudFront is AWS's Content Delivery Network (CDN). It caches your content at edge locations worldwide for faster delivery.

| Feature | Description |
|---------|-------------|
| Edge Locations | 400+ locations globally |
| Origin | Source of content (S3, EC2, ALB, custom) |
| Distribution | Configuration that tells CloudFront where to get content |
| TTL | Time to Live - how long content is cached |

Common use cases:
- Serve static assets (images, CSS, JS) from S3
- Accelerate API responses
- Stream video content
- Protect origin servers from direct traffic

---

## Create Distribution (Console)

```
CloudFront > Create Distribution

1. Origin Settings:
   - Origin Domain: your-bucket.s3.amazonaws.com (or EC2/ALB)
   - Origin Path: /public (optional subfolder)
   - Origin Access: Origin Access Control (OAC) for S3

2. Default Cache Behavior:
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD (for static), or all methods (for API)
   - Cache Policy: CachingOptimized (for static assets)

3. Settings:
   - Price Class: Use All Edge Locations (or select specific regions)
   - Alternate Domain Name (CNAME): cdn.yourdomain.com
   - SSL Certificate: Custom SSL (from ACM)
   - Default Root Object: index.html

4. Create Distribution
```

---

## CloudFront with S3

### Step 1 - Create S3 Bucket

```bash
aws s3 mb s3://my-static-assets --region ap-south-1
```

### Step 2 - Create Origin Access Control (OAC)

OAC restricts S3 access so only CloudFront can read from the bucket.

```
CloudFront > Origin Access > Create Control Setting
  - Name: my-oac
  - Origin Type: S3
  - Signing Behavior: Sign requests
```

### Step 3 - S3 Bucket Policy

After creating the distribution, update the S3 bucket policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-static-assets/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### Step 4 - Access Content

```
https://d1234abcdef.cloudfront.net/images/logo.png
```

---

## CloudFront with EC2/Load Balancer

For dynamic applications (Node.js, Django, etc.):

```
Origin Settings:
  - Origin Domain: your-alb-dns.amazonaws.com (or EC2 public IP)
  - Protocol: HTTPS Only (or Match Viewer)
  - HTTP Port: 80
  - HTTPS Port: 443

Cache Behavior:
  - Cache Policy: CachingDisabled (for dynamic content)
  - Origin Request Policy: AllViewer
```

---

## Custom Domain with SSL

### Step 1 - Request SSL Certificate (ACM)

Certificate must be in us-east-1 region for CloudFront.

```
ACM (us-east-1) > Request Certificate > Public
  - Domain: cdn.yourdomain.com
  - Validation: DNS
  - Add CNAME record to your DNS
  - Wait for validation
```

### Step 2 - Add to Distribution

```
CloudFront > Distribution > Edit
  - Alternate Domain Names: cdn.yourdomain.com
  - Custom SSL Certificate: select from ACM
  - Save
```

### Step 3 - DNS Configuration

Add CNAME record in your DNS provider:
```
Type: CNAME
Name: cdn
Value: d1234abcdef.cloudfront.net
```

---

## Cache Invalidation

When you update files, CloudFront may serve old cached versions. Use invalidation to clear the cache.

```bash
# Invalidate specific file
Syntax:- aws cloudfront create-invalidation --distribution-id <ID> --paths "/<path>"
Example:- aws cloudfront create-invalidation --distribution-id E1234XYZ --paths "/index.html"

# Invalidate multiple files
aws cloudfront create-invalidation --distribution-id E1234XYZ --paths "/css/*" "/js/*"

# Invalidate everything
aws cloudfront create-invalidation --distribution-id E1234XYZ --paths "/*"

# Check invalidation status
aws cloudfront get-invalidation --distribution-id E1234XYZ --id I1234ABC
```

Note: First 1,000 invalidation paths per month are free. After that, $0.005 per path.

---

## AWS CLI Commands

```bash
# List all distributions
aws cloudfront list-distributions --query "DistributionList.Items[].{Id:Id,Domain:DomainName,Status:Status}" --output table

# Get distribution details
aws cloudfront get-distribution --id E1234XYZ

# Disable distribution (required before deleting)
# Must update config with Enabled: false

# Delete distribution
aws cloudfront delete-distribution --id E1234XYZ --if-match ETAG_VALUE
```
