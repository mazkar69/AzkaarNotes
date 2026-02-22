# AzkaarNotes

A developer knowledge base — markdown documentation, deployment guides, and reusable code snippets for DevOps, full-stack development, and cloud workflows.

---

## Repository Structure

```
AzkaarNotes/
├── deployment/          # All deployment guides
│   ├── apache/          # Apache web server deployments
│   ├── nginx/           # Nginx web server deployments
│   └── docker/          # Docker containerized services
├── ubuntu/              # Linux server administration & setup
│   └── notes/           # General Ubuntu/Linux notes
├── cloud/
│   └── aws/             # AWS guides (EBS, EC2, S3, IAM, RDS, CloudFront)
├── docs/                # Development topic documentation
│   ├── ffmpeg/          # FFmpeg commands & usage
│   ├── nodejs/          # Node.js notes
│   ├── ssh/             # SSH, SCP, SFTP guides
│   └── typescript/      # TypeScript learning notes
├── nodejs/              # Node.js utilities, middleware & patterns
├── reactjs/             # React.js components & utility snippets
├── database/            # Database guides (MongoDB, Redis)
├── git/                 # Git commands, workflows & setup
├── references/          # General reference docs, APIs, notes
└── .github/             # GitHub & Copilot configuration
```

---

## Deployment Guides

### Apache (`deployment/apache/`)
| Guide | Description |
|-------|-------------|
| [Deploy_NodeExpress_Apache_Github.md](deployment/apache/Deploy_NodeExpress_Apache_Github.md) | Node/Express with Apache & GitHub |
| [Deploy_NodeExpress_Apache.md](deployment/apache/Deploy_NodeExpress_Apache.md) | Node/Express with Apache |
| [Deploy_React_Vue_Next_Nuxt_Apache_Github.md](deployment/apache/Deploy_React_Vue_Next_Nuxt_Apache_Github.md) | React/Vue/Next/Nuxt with Apache & GitHub |
| [Deploy_NextJS_Apache_Github.md](deployment/apache/Deploy_NextJS_Apache_Github.md) | Next.js with Apache & GitHub |
| [Deploy_NuxtJS_Apache_Github.md](deployment/apache/Deploy_NuxtJS_Apache_Github.md) | Nuxt.js with Apache & GitHub |
| [Deploy_Laravel_Apache_Github.md](deployment/apache/Deploy_Laravel_Apache_Github.md) | Laravel with Apache & GitHub |
| [Deploy_Laravel_Apache.md](deployment/apache/Deploy_Laravel_Apache.md) | Laravel with Apache |
| [Deploy_Django_Apache_Github.md](deployment/apache/Deploy_Django_Apache_Github.md) | Django with Apache & GitHub |
| [Deploy_Django_Apache.md](deployment/apache/Deploy_Django_Apache.md) | Django with Apache |
| [Deploy_HTML_Static_Apache_Github.md](deployment/apache/Deploy_HTML_Static_Apache_Github.md) | Static HTML with Apache & GitHub |

### Nginx (`deployment/nginx/`)
| Guide | Description |
|-------|-------------|
| [Deploy_NodeExpress_Nginx.md](deployment/nginx/Deploy_NodeExpress_Nginx.md) | Node/Express with Nginx |
| [Deploy_NextJS_Nginx.md](deployment/nginx/Deploy_NextJS_Nginx.md) | Next.js with Nginx |
| [Deploy_NuxtJS_Nginx.md](deployment/nginx/Deploy_NuxtJS_Nginx.md) | Nuxt.js with Nginx |
| [Deploy_React_Vue_Nginx.md](deployment/nginx/Deploy_React_Vue_Nginx.md) | React/Vue with Nginx |
| [Deploy_Laravel_Nginx.md](deployment/nginx/Deploy_Laravel_Nginx.md) | Laravel with Nginx |
| [Deploy_Django_Nginx.md](deployment/nginx/Deploy_Django_Nginx.md) | Django with Nginx |
| [Deploy_HTML_Static_Nginx_Github.md](deployment/nginx/Deploy_HTML_Static_Nginx_Github.md) | Static HTML with Nginx & GitHub |
| [Deploy_PHP_Project_Nginx.md](deployment/nginx/Deploy_PHP_Project_Nginx.md) | PHP project with Nginx |
| [Configure_PHP_Nginx.md](deployment/nginx/Configure_PHP_Nginx.md) | Configure PHP with Nginx |
| [Create_nginx_sites-available.md](deployment/nginx/Create_nginx_sites-available.md) | Create Nginx sites-available config |
| [SSL_Cert_Nginx.md](deployment/nginx/SSL_Cert_Nginx.md) | SSL certificate for Nginx |
| [LEMP_Stack_Installation.md](deployment/nginx/LEMP_Stack_Installation.md) | LEMP stack installation |
| [Install_phpmyadmin_Nginx.md](deployment/nginx/Install_phpmyadmin_Nginx.md) | phpMyAdmin on Nginx |
| [Password_Protected_Website_Nginx.md](deployment/nginx/Password_Protected_Website_Nginx.md) | Password-protect a site on Nginx |
| [Point_Domain_Host_HTML_Website_Nginx.md](deployment/nginx/Point_Domain_Host_HTML_Website_Nginx.md) | Point domain to Nginx site |
| [nginx-setup-window.md](deployment/nginx/nginx-setup-window.md) | Nginx setup on Windows |
| [nginx-www-redirect.md](deployment/nginx/nginx-www-redirect.md) | Nginx www redirect config |
| [phpMyAdmin-ubuntu.md](deployment/nginx/phpMyAdmin-ubuntu.md) | phpMyAdmin on Ubuntu |
| [wordpress-setup.md](deployment/nginx/wordpress-setup.md) | WordPress setup on Nginx |
| [Nginx_Rate_Limiting.md](deployment/nginx/Nginx_Rate_Limiting.md) | Nginx rate limiting & throttling |

### Docker (`deployment/docker/`)
| Guide | Description |
|-------|-------------|
| [Docker_Install.md](deployment/docker/Docker_Install.md) | Install Docker |
| [docker.basic1.md](deployment/docker/docker.basic1.md) | Docker basics - Part 1 |
| [docker.basic2.md](deployment/docker/docker.basic2.md) | Docker basics - Part 2 |
| [Docker_Compose.md](deployment/docker/Docker_Compose.md) | Docker Compose multi-container setup |
| [Mongodb_Installation.md](deployment/docker/Mongodb_Installation.md) | MongoDB via Docker |
| [Redis_Installation.md](deployment/docker/Redis_Installation.md) | Redis via Docker |
| [Nginx_Install.md](deployment/docker/Nginx_Install.md) | Nginx via Docker |
| [nginx.conf](deployment/docker/nginx.conf) | Sample Nginx config for Docker |

---

## Server Administration (`ubuntu/`)

Linux server setup, security, databases, and package installation for Ubuntu. See [ubuntu/README.md](ubuntu/README.md) for full index.

---

## Cloud (`cloud/aws/`)

| Guide | Description |
|-------|-------------|
| [EBS_Attach.md](cloud/aws/EBS_Attach.md) | Attach EBS volume to EC2 |
| [EBS_Resize.md](cloud/aws/EBS_Resize.md) | Resize EBS volume |
| [AWS_EC2_Setup.md](cloud/aws/AWS_EC2_Setup.md) | EC2 instance launch & configuration |
| [AWS_S3_File_Upload.md](cloud/aws/AWS_S3_File_Upload.md) | S3 file upload with Node.js |
| [AWS_IAM_Roles.md](cloud/aws/AWS_IAM_Roles.md) | IAM users, roles & policies |
| [AWS_CloudFront_CDN.md](cloud/aws/AWS_CloudFront_CDN.md) | CloudFront CDN setup |
| [AWS_RDS_Setup.md](cloud/aws/AWS_RDS_Setup.md) | RDS database setup & connection |

---

## Documentation (`docs/`)

| Topic | File |
|-------|------|
| Vite | [basics_of_vite.md](docs/basics_of_vite.md) |
| Content Types | [content-type.md](docs/content-type.md) |
| Copilot Custom Chat | [copilotCustomChat.md](docs/copilotCustomChat.md) |
| Framer Motion | [framer-motion.md](docs/framer-motion.md) |
| Redux Toolkit | [redux_toolkit.md](docs/redux_toolkit.md) |
| FFmpeg | [ffmpeg/](docs/ffmpeg/) |
| Node.js | [nodejs/](docs/nodejs/) |
| SSH/SCP/SFTP | [ssh/](docs/ssh/) |
| TypeScript | [typescript/](docs/typescript/) |
| JWT Authentication | [JWT_Authentication.md](docs/JWT_Authentication.md) |
| REST API Best Practices | [REST_API_Best_Practices.md](docs/REST_API_Best_Practices.md) |
| Environment Variables | [Environment_Variables.md](docs/Environment_Variables.md) |
| React Performance | [React_Performance_Tips.md](docs/React_Performance_Tips.md) |
| WebSockets / Socket.IO | [WebSockets_SocketIO.md](docs/WebSockets_SocketIO.md) |

---

## Node.js (`nodejs/`)

Node.js utilities, middleware, and reusable snippets using ES modules.

| File | Description |
|------|-------------|
| [Node_Error_Handler_Middleware.md](nodejs/Node_Error_Handler_Middleware.md) | Express error handler middleware pattern |
| [asyncHandler.js](nodejs/asyncHandler.js) | Async/await error wrapper for Express |
| [connectDB.js](nodejs/connectDB.js) | MongoDB connection utility |
| [cryptography.js](nodejs/cryptography.js) | Encryption/decryption utilities |
| [errorHandler.js](nodejs/errorHandler.js) | Global error handler |
| [fileUpload.js](nodejs/fileUpload.js) | File upload handler |
| [generateOTP.js](nodejs/generateOTP.js) | OTP generation |
| [otpSecurity.js](nodejs/otpSecurity.js) | OTP verification & security |
| [pagination.js](nodejs/pagination.js) | Pagination helper |
| [protectMiddleware.js](nodejs/protectMiddleware.js) | Auth protection middleware |
| [rateLimiter.js](nodejs/rateLimiter.js) | Rate limiting middleware |

---

## React.js (`reactjs/`)

React.js components and utility snippets.

| File | Description |
|------|-------------|
| [apiResponse.js](reactjs/apiResponse.js) | Standardized API response helper |
| [debouncing.js](reactjs/debouncing.js) | Debounce function |
| [SelectCity.jsx](reactjs/SelectCity.jsx) | City selector React component |
| [slugify.js](reactjs/slugify.js) | URL slug generator |
| [validators.js](reactjs/validators.js) | Input validation utilities |

---

## Database (`database/`)

Database guides and usage patterns.

| File | Description |
|------|-------------|
| [MongoDB_Aggregation.md](database/MongoDB_Aggregation.md) | MongoDB aggregation pipeline guide |
| [MongoDB_Backup.md](database/MongoDB_Backup.md) | MongoDB backup & restore guide |
| [Redis_Usage.md](database/Redis_Usage.md) | Redis caching patterns with Node.js |

---

## Git (`git/`)

Git commands, workflows, and account setup.

| File | Description |
|------|-------------|
| [Git_Commands_Cheatsheet.md](git/Git_Commands_Cheatsheet.md) | Git commands reference |
| [Git_Workflow_Branching.md](git/Git_Workflow_Branching.md) | Git branching strategies & workflows |
| [Git_Add_Multiple_GitHub_Account.md](git/Git_Add_Multiple_GitHub_Account.md) | Multiple GitHub accounts setup |

---

## References (`references/`)

| File | Description |
|------|-------------|
| [npm_package_reference.md](references/npm_package_reference.md) | npm package reference list |
| [useful_apis.md](references/useful_apis.md) | Collection of useful APIs |
| [useful_links_and_notes.md](references/useful_links_and_notes.md) | Useful links & dev notes |
| [deployment-setup.md](references/deployment-setup.md) | General deployment setup notes |
| [country_notes.md](references/country_notes.md) | Country-related notes |
| [countriesData.json](references/countriesData.json) | Countries JSON data |
| [Linux_Commands_Cheatsheet.md](references/Linux_Commands_Cheatsheet.md) | Essential Linux commands reference |
| [Regex_Cheatsheet.md](references/Regex_Cheatsheet.md) | Regular expressions quick reference |
