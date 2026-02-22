# Copilot Instructions for AzkaarNotes

## Project Overview

This is a **developer knowledge base** - a collection of markdown documentation, deployment guides, and reusable code snippets. It's NOT an application codebase but a reference repository for DevOps, full-stack development, and cloud deployment workflows.

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `deployment/apache/` | Apache deployment guides — files named `Apache_Deploy_*.md` |
| `deployment/nginx/` | Nginx deployment guides and configuration — files named `Nginx_*.md` |
| `deployment/docker/` | Docker basics and containerized services — files named `Docker_*.md` |
| `ubuntu/` | Linux server administration, security, database setup, package installation — files named `Ubuntu_*.md` |
| `cloud/aws/` | AWS-specific guides (EC2, EBS, S3, IAM, RDS, CloudFront) — files named `AWS_*.md` |
| `docs/` | Development topic documentation — files named `First_Letter_Cap.md` |
| `docs/ffmpeg/` | FFmpeg commands — files named `FFmpeg_*.md` |
| `docs/ssh/` | SSH, SCP, SFTP guides — files named `SSH_*.md` |
| `docs/typescript/` | TypeScript learning notes — files named `TypeScript_*.md` |
| `docs/nodejs/` | Node.js notes |
| `nodejs/` | Node.js utilities, middleware, and reusable snippets (JS files in camelCase) |
| `reactjs/` | React.js components (PascalCase) and utility snippets (camelCase) |
| `database/` | Database guides (MongoDB, Redis) — files named `MongoDB_*.md`, `Redis_*.md` |
| `git/` | Git commands, workflows, and setup — files named `Git_*.md` |
| `references/` | General reference docs, APIs, npm packages, and misc notes |

## Naming Conventions

### Folders
- Always **lowercase**: `deployment/`, `ubuntu/`, `nodejs/`, `reactjs/`, `database/`, `git/`, `cloud/`, `docs/`, `references/`

### Markdown Files
- Use **technology prefix** + **First_Letter_Cap** format: `Prefix_Topic_Name.md`
- Each folder has its own prefix:
  - `deployment/apache/` → `Apache_Deploy_Framework_Github.md`
  - `deployment/nginx/` → `Nginx_Deploy_Framework.md`, `Nginx_Configure_PHP.md`
  - `deployment/docker/` → `Docker_Install.md`, `Docker_Compose.md`
  - `ubuntu/` → `Ubuntu_Install_Node_NPM.md`, `Ubuntu_UFW_Firewall_Setup.md`
  - `cloud/aws/` → `AWS_EC2_Setup.md`, `AWS_EBS_Attach.md`
  - `docs/ffmpeg/` → `FFmpeg_Commands.md`
  - `docs/ssh/` → `SSH_Key_Setup.md`, `SSH_Aliases.md`
  - `docs/typescript/` → `TypeScript_1_Basics.md`
  - `database/` → `MongoDB_Aggregation.md`, `Redis_Usage.md`
  - `git/` → `Git_Commands_Cheatsheet.md`, `Git_Workflow_Branching.md`
  - `docs/` root → `First_Letter_Cap.md` e.g. `Redux_Toolkit.md`, `JWT_Authentication.md`

### JavaScript / JSX Files
- **React components**: PascalCase — `SelectCity.jsx`
- **Utility functions / middleware**: camelCase — `connectDB.js`, `asyncHandler.js`, `rateLimiter.js`

## Documentation Conventions

### Markdown Structure Pattern
All deployment guides follow this structure (see [Apache_Deploy_NodeExpress_Github.md](deployment/apache/Apache_Deploy_NodeExpress_Github.md)):
1. Title with technology stack
2. Prerequisites/software versions
3. DNS/Domain configuration table
4. Step-by-step shell commands with syntax + example format
5. Verification commands

### Command Documentation Format
```markdown
```sh
Syntax:- command <PLACEHOLDER>
Example:- command actual-value
```
```

### Code Snippets in `nodejs/` and `reactjs/`
- Use ES modules (`import`/`export`) — see [connectDB.js](nodejs/connectDB.js)
- Environment variables via `process.env`
- Export named functions or default for single utilities

## Content Patterns

### Framework Coverage
- **Node.js/Express**: PM2 process management, reverse proxy setup
- **React/Vue/Next/Nuxt**: Static build deployment
- **Laravel/Django**: PHP-FPM and Python WSGI configurations
- **Docker**: Service-specific installation guides

### Reference Documentation Style
Tables for package/link references (see [npm_package_reference.md](references/npm_package_reference.md)):
```markdown
| Package | Description |
|---------|-------------|
| `package-name` | What it does. *(Project where used)* |
```

## When Adding New Content

1. **New deployment guide**: Use `Prefix_Topic.md` naming and add to the correct `deployment/` subdirectory
   - Apache → `Apache_Deploy_Framework_Github.md` in `deployment/apache/`
   - Nginx → `Nginx_Topic.md` in `deployment/nginx/`
   - Docker → `Docker_Topic.md` in `deployment/docker/`
2. **New Node.js utility**: Add camelCase `.js` file to `nodejs/` with ES module exports
3. **New React component**: Add PascalCase `.jsx` file to `reactjs/`
4. **New database guide**: Add `MongoDB_Topic.md` or `Redis_Topic.md` to `database/`
5. **New Git guide**: Add `Git_Topic.md` to `git/`
6. **New AWS guide**: Add `AWS_Topic.md` to `cloud/aws/`
7. **New Ubuntu guide**: Add `Ubuntu_Topic.md` to `ubuntu/`
8. **New reference doc**: Add to `references/` with table format for lists
9. **Topic documentation**: Include Table of Contents for long docs (see [Redux_Toolkit.md](docs/Redux_Toolkit.md))

## Key Technologies Referenced

- **Web Servers**: Apache2, Nginx
- **Process Managers**: PM2 (Node.js)
- **Databases**: MongoDB, MySQL, Redis
- **Cloud**: AWS (EC2, EBS, S3, IAM, RDS, CloudFront)
- **Containerization**: Docker, Docker Compose
- **Frameworks**: Express, Next.js, Nuxt.js, Laravel, Django, React, Vue
- **Auth / Security**: JWT, bcrypt, rate limiting, Fail2ban, UFW
