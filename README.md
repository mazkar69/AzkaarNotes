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
| [Apache_Deploy_NodeExpress_Github.md](deployment/apache/Apache_Deploy_NodeExpress_Github.md) | Node/Express with Apache & GitHub |
| [Apache_Deploy_NodeExpress.md](deployment/apache/Apache_Deploy_NodeExpress.md) | Node/Express with Apache |
| [Apache_Deploy_React_Vue_Next_Nuxt_Github.md](deployment/apache/Apache_Deploy_React_Vue_Next_Nuxt_Github.md) | React/Vue/Next/Nuxt with Apache & GitHub |
| [Apache_Deploy_NextJS_Github.md](deployment/apache/Apache_Deploy_NextJS_Github.md) | Next.js with Apache & GitHub |
| [Apache_Deploy_NuxtJS_Github.md](deployment/apache/Apache_Deploy_NuxtJS_Github.md) | Nuxt.js with Apache & GitHub |
| [Apache_Deploy_Laravel_Github.md](deployment/apache/Apache_Deploy_Laravel_Github.md) | Laravel with Apache & GitHub |
| [Apache_Deploy_Laravel.md](deployment/apache/Apache_Deploy_Laravel.md) | Laravel with Apache |
| [Apache_Deploy_Django_Github.md](deployment/apache/Apache_Deploy_Django_Github.md) | Django with Apache & GitHub |
| [Apache_Deploy_Django.md](deployment/apache/Apache_Deploy_Django.md) | Django with Apache |
| [Apache_Deploy_HTML_Static_Github.md](deployment/apache/Apache_Deploy_HTML_Static_Github.md) | Static HTML with Apache & GitHub |

### Nginx (`deployment/nginx/`)
| Guide | Description |
|-------|-------------|
| [Nginx_Deploy_NodeExpress.md](deployment/nginx/Nginx_Deploy_NodeExpress.md) | Node/Express with Nginx |
| [Nginx_Deploy_NextJS.md](deployment/nginx/Nginx_Deploy_NextJS.md) | Next.js with Nginx |
| [Nginx_Deploy_NuxtJS.md](deployment/nginx/Nginx_Deploy_NuxtJS.md) | Nuxt.js with Nginx |
| [Nginx_Deploy_React_Vue.md](deployment/nginx/Nginx_Deploy_React_Vue.md) | React/Vue with Nginx |
| [Nginx_Deploy_Laravel.md](deployment/nginx/Nginx_Deploy_Laravel.md) | Laravel with Nginx |
| [Nginx_Deploy_Django.md](deployment/nginx/Nginx_Deploy_Django.md) | Django with Nginx |
| [Nginx_Deploy_HTML_Static_Github.md](deployment/nginx/Nginx_Deploy_HTML_Static_Github.md) | Static HTML with Nginx & GitHub |
| [Nginx_Deploy_PHP_Project.md](deployment/nginx/Nginx_Deploy_PHP_Project.md) | PHP project with Nginx |
| [Nginx_Configure_PHP.md](deployment/nginx/Nginx_Configure_PHP.md) | Configure PHP with Nginx |
| [Nginx_Create_Sites_Available.md](deployment/nginx/Nginx_Create_Sites_Available.md) | Create Nginx sites-available config |
| [Nginx_SSL_Cert.md](deployment/nginx/Nginx_SSL_Cert.md) | SSL certificate for Nginx |
| [Nginx_LEMP_Stack_Installation.md](deployment/nginx/Nginx_LEMP_Stack_Installation.md) | LEMP stack installation |
| [Nginx_Install_PhpMyAdmin.md](deployment/nginx/Nginx_Install_PhpMyAdmin.md) | phpMyAdmin on Nginx |
| [Nginx_Password_Protected_Website.md](deployment/nginx/Nginx_Password_Protected_Website.md) | Password-protect a site on Nginx |
| [Nginx_Point_Domain_Host_HTML_Website.md](deployment/nginx/Nginx_Point_Domain_Host_HTML_Website.md) | Point domain to Nginx site |
| [Nginx_Setup_Window.md](deployment/nginx/Nginx_Setup_Window.md) | Nginx setup on Windows |
| [Nginx_WWW_Redirect.md](deployment/nginx/Nginx_WWW_Redirect.md) | Nginx www redirect config |
| [Nginx_PhpMyAdmin_Ubuntu.md](deployment/nginx/Nginx_PhpMyAdmin_Ubuntu.md) | phpMyAdmin on Ubuntu |
| [Nginx_WordPress_Setup.md](deployment/nginx/Nginx_WordPress_Setup.md) | WordPress setup on Nginx |
| [Nginx_Rate_Limiting.md](deployment/nginx/Nginx_Rate_Limiting.md) | Nginx rate limiting & throttling |

### Docker (`deployment/docker/`)
| Guide | Description |
|-------|-------------|
| [Docker_Install.md](deployment/docker/Docker_Install.md) | Install Docker |
| [Docker_Basic_1.md](deployment/docker/Docker_Basic_1.md) | Docker basics - Part 1 |
| [Docker_Basic_2.md](deployment/docker/Docker_Basic_2.md) | Docker basics - Part 2 |
| [Docker_Compose.md](deployment/docker/Docker_Compose.md) | Docker Compose multi-container setup |
| [Docker_MongoDB_Installation.md](deployment/docker/Docker_MongoDB_Installation.md) | MongoDB via Docker |
| [Docker_Redis_Installation.md](deployment/docker/Docker_Redis_Installation.md) | Redis via Docker |
| [Docker_Nginx_Installation.md](deployment/docker/Docker_Nginx_Installation.md) | Nginx via Docker |
| [Docker_Nginx.conf](deployment/docker/Docker_Nginx.conf) | Sample Nginx config for Docker |

---

## Server Administration (`ubuntu/`)

Linux server setup, security, databases, and package installation for Ubuntu.

| File | Description |
|------|-------------|
| [Ubuntu_Fresh_Instance_Commands.md](ubuntu/Ubuntu_Fresh_Instance_Commands.md) | Fresh server initial setup commands |
| [Ubuntu_Create_Sudo_User.md](ubuntu/Ubuntu_Create_Sudo_User.md) | Create sudo user |
| [Ubuntu_Set_Timezone.md](ubuntu/Ubuntu_Set_Timezone.md) | Set server timezone |
| [Ubuntu_UFW_Firewall_Setup.md](ubuntu/Ubuntu_UFW_Firewall_Setup.md) | UFW firewall setup |
| [Ubuntu_Fail2ban_Security.md](ubuntu/Ubuntu_Fail2ban_Security.md) | Fail2ban security setup |
| [Ubuntu_SSL_Cert_Apache2.md](ubuntu/Ubuntu_SSL_Cert_Apache2.md) | SSL certificate for Apache2 |
| [Ubuntu_LAMP_Stack_Installation.md](ubuntu/Ubuntu_LAMP_Stack_Installation.md) | LAMP stack installation |
| [Ubuntu_LEMP_Stack_Installation.md](ubuntu/Ubuntu_LEMP_Stack_Installation.md) | LEMP stack installation |
| [Ubuntu_Install_Node_NPM.md](ubuntu/Ubuntu_Install_Node_NPM.md) | Install Node.js & NPM |
| [Ubuntu_Install_Composer.md](ubuntu/Ubuntu_Install_Composer.md) | Install Composer |
| [Ubuntu_Install_Config_MongoDB.md](ubuntu/Ubuntu_Install_Config_MongoDB.md) | Install & configure MongoDB |
| [Ubuntu_Install_PhpMyAdmin_Apache.md](ubuntu/Ubuntu_Install_PhpMyAdmin_Apache.md) | phpMyAdmin on Apache |
| [Ubuntu_PM2_Process_Manager.md](ubuntu/Ubuntu_PM2_Process_Manager.md) | PM2 process manager |
| [Ubuntu_Secure_MySQL.md](ubuntu/Ubuntu_Secure_MySQL.md) | Secure MySQL installation |
| [Ubuntu_Assign_MySQL_DB_To_User.md](ubuntu/Ubuntu_Assign_MySQL_DB_To_User.md) | Assign MySQL DB to user |
| [Ubuntu_Create_MongoDB_User.md](ubuntu/Ubuntu_Create_MongoDB_User.md) | Create MongoDB user |
| [Ubuntu_Import_Export_SQL_File.md](ubuntu/Ubuntu_Import_Export_SQL_File.md) | Import/export SQL files |
| [Ubuntu_Point_Domain_Host_HTML_Website.md](ubuntu/Ubuntu_Point_Domain_Host_HTML_Website.md) | Point domain to HTML website |
| [Ubuntu_Disable_Dir_Browsing_Apache.md](ubuntu/Ubuntu_Disable_Dir_Browsing_Apache.md) | Disable directory browsing on Apache |
| [Ubuntu_Password_Protected_Website_Apache.md](ubuntu/Ubuntu_Password_Protected_Website_Apache.md) | Password-protect website on Apache |
| [Ubuntu_Remove_Apache2.md](ubuntu/Ubuntu_Remove_Apache2.md) | Remove Apache2 |
| [Ubuntu_Linux_User_SSH_Notes.md](ubuntu/Ubuntu_Linux_User_SSH_Notes.md) | Linux user & SSH notes |
| [Ubuntu_Samba_Configuration_Windows.md](ubuntu/Ubuntu_Samba_Configuration_Windows.md) | Samba configuration for Windows |
| [Ubuntu_Part_1.md](ubuntu/Ubuntu_Part_1.md) | Ubuntu general notes - Part 1 |
| [Ubuntu_Part_2.md](ubuntu/Ubuntu_Part_2.md) | Ubuntu general notes - Part 2 |

---

## Cloud (`cloud/aws/`)

| Guide | Description |
|-------|-------------|
| [AWS_EBS_Attach.md](cloud/aws/AWS_EBS_Attach.md) | Attach EBS volume to EC2 |
| [AWS_EBS_Resize.md](cloud/aws/AWS_EBS_Resize.md) | Resize EBS volume |
| [AWS_EC2_Setup.md](cloud/aws/AWS_EC2_Setup.md) | EC2 instance launch & configuration |
| [AWS_S3_File_Upload.md](cloud/aws/AWS_S3_File_Upload.md) | S3 file upload with Node.js |
| [AWS_IAM_Roles.md](cloud/aws/AWS_IAM_Roles.md) | IAM users, roles & policies |
| [AWS_CloudFront_CDN.md](cloud/aws/AWS_CloudFront_CDN.md) | CloudFront CDN setup |
| [AWS_RDS_Setup.md](cloud/aws/AWS_RDS_Setup.md) | RDS database setup & connection |

---

## Documentation (`docs/`)

| Topic | File |
|-------|------|
| Vite | [Basics_Of_Vite.md](docs/Basics_Of_Vite.md) |
| Content Types | [Content_Type.md](docs/Content_Type.md) |
| Copilot Custom Chat | [Copilot_Custom_Chat.md](docs/Copilot_Custom_Chat.md) |
| Framer Motion | [Framer_Motion.md](docs/Framer_Motion.md) |
| Redux Toolkit | [Redux_Toolkit.md](docs/Redux_Toolkit.md) |
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
| [countriesData.json](references/countriesData.json) | Countries JSON data |
| [country_notes.md](references/country_notes.md) | Country-related notes |
| [Linux_Commands_Cheatsheet.md](references/Linux_Commands_Cheatsheet.md) | Essential Linux commands reference |
| [Regex_Cheatsheet.md](references/Regex_Cheatsheet.md) | Regular expressions quick reference |
