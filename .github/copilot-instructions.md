# Copilot Instructions for AzkaarNotes

## Project Overview

This is a **developer knowledge base** - a collection of markdown documentation, deployment guides, and reusable code snippets. It's NOT an application codebase but a reference repository for DevOps, full-stack development, and cloud deployment workflows.

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `deployment/apache/` | Apache deployment guides for all frameworks |
| `deployment/nginx/` | Nginx deployment guides and configuration |
| `deployment/docker/` | Docker basics, containerized service installation (MongoDB, Redis, Nginx) |
| `ubuntu/` | Linux server administration, security, database setup, package installation |
| `ubuntu/notes/` | General Ubuntu/Linux notes and Samba configuration |
| `cloud/aws/` | AWS-specific guides (EBS volumes) |
| `docs/` | Development topics (Redux, SSH, Vite, FFmpeg, TypeScript) |
| `nodejs/` | Node.js middleware patterns |
| `utils/` | Reusable JavaScript/Node.js utility snippets |
| `references/` | Cross-cutting topics (APIs, npm packages, MongoDB backup, misc notes) |

## Documentation Conventions

### Markdown Structure Pattern
All deployment guides follow this structure (see [Deploy_NodeExpress_Apache_Github.md](deployment/apache/Deploy_NodeExpress_Apache_Github.md)):
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

### Code Snippets in `utils/`
- Use ES modules (`import`/`export`) - see [connectDB.js](utils/connectDB.js)
- Environment variables via `process.env`
- Export named functions or default for single utilities

## Content Patterns

### Deployment Guides Naming
`Deploy_<Framework>_<WebServer>_<Optional:Github>.md`
- Examples: `Deploy_NodeExpress_Apache_Github.md`, `Deploy_Laravel_Nginx.md`

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

1. **New deployment guide**: Follow existing naming convention and add to the appropriate `deployment/` subdirectory (`apache/`, `nginx/`, or `docker/`)
2. **New utility function**: Add to `utils/` with ES module exports
3. **New reference doc**: Add to `references/` with table format for lists, include external links with descriptions
4. **Topic documentation**: Include Table of Contents for long docs (see [redux_toolkit.md](docs/redux_toolkit.md))

## Key Technologies Referenced

- **Web Servers**: Apache2, Nginx
- **Process Managers**: PM2 (Node.js)
- **Databases**: MongoDB, MySQL
- **Cloud**: AWS (EC2, EBS, S3)
- **Containerization**: Docker
- **Frameworks**: Express, Next.js, Nuxt.js, Laravel, Django, React, Vue
