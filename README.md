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
│   └── aws/             # AWS-specific guides (EBS)
├── docs/                # Development topic documentation
│   ├── ffmpeg/          # FFmpeg commands & usage
│   ├── nodejs/          # Node.js notes
│   ├── ssh/             # SSH, SCP, SFTP guides
│   └── typescript/      # TypeScript learning notes
├── nodejs/              # Node.js middleware & patterns
├── utils/               # Reusable JS/Node.js utility snippets
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

### Docker (`deployment/docker/`)
| Guide | Description |
|-------|-------------|
| [Docker_Install.md](deployment/docker/Docker_Install.md) | Install Docker |
| [docker.basic1.md](deployment/docker/docker.basic1.md) | Docker basics - Part 1 |
| [docker.basic2.md](deployment/docker/docker.basic2.md) | Docker basics - Part 2 |
| [Mongodb_Installation.md](deployment/docker/Mongodb_Installation.md) | MongoDB via Docker |
| [Redis_Installation.md](deployment/docker/Redis_Installation.md) | Redis via Docker |
| [Nginx_Install.md](deployment/docker/Nginx_Install.md) | Nginx via Docker |
| [nginx.conf](deployment/docker/nginx.conf) | Sample Nginx config for Docker |

---

## Server Administration (`ubuntu/`)

Linux server setup, security, databases, and package installation for Ubuntu. See [ubuntu/README.md](ubuntu/README.md) for full index.

---

## Cloud (`cloud/`)

| Guide | Description |
|-------|-------------|
| [EBS_Attach.md](cloud/aws/EBS_Attach.md) | Attach EBS volume to EC2 |
| [EBS_Resize.md](cloud/aws/EBS_Resize.md) | Resize EBS volume |

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

---

## Node.js (`nodejs/`)

| File | Description |
|------|-------------|
| [error-handler-middleware.md](nodejs/error-handler-middleware.md) | Express error handler middleware pattern |

---

## Utility Functions (`utils/`)

Reusable JavaScript/Node.js snippets using ES modules.

| File | Description |
|------|-------------|
| [apiResponse.js](utils/apiResponse.js) | Standardized API response helper |
| [connectDB.js](utils/connectDB.js) | MongoDB connection utility |
| [cryptography.js](utils/cryptography.js) | Encryption/decryption utilities |
| [debouncing.js](utils/debouncing.js) | Debounce function |
| [errorHandler.js](utils/errorHandler.js) | Global error handler |
| [fileUpload.js](utils/fileUpload.js) | File upload handler |
| [generateOTP.js](utils/generateOTP.js) | OTP generation |
| [otpSecurity.js](utils/otpSecurity.js) | OTP verification & security |
| [pagination.js](utils/pagination.js) | Pagination helper |
| [protect.js](utils/protect.js) | Auth protection middleware |
| [rateLimiter.js](utils/rateLimiter.js) | Rate limiting middleware |
| [SelectCity.jsx](utils/SelectCity.jsx) | City selector React component |
| [slugify.js](utils/slugify.js) | URL slug generator |
| [validators.js](utils/validators.js) | Input validation utilities |

---

## Other Reference Files

| File | Description |
|------|-------------|
| [npm_package_reference.md](npm_package_reference.md) | npm package reference list |
| [useful_apis.md](useful_apis.md) | Collection of useful APIs |
| [useful_links_and_notes.md](useful_links_and_notes.md) | Useful links & dev notes |
| [mongodb_backup.md](mongodb_backup.md) | MongoDB backup & restore guide |
| [deployment-setup.md](deployment-setup.md) | General deployment setup notes |
| [Add_Multiple_GitHub_Account.md](Add_Multiple_GitHub_Account.md) | Multiple GitHub accounts setup |
| [country_notes.md](country_notes.md) | Country-related notes |
| [countriesData.json](countriesData.json) | Countries JSON data |
