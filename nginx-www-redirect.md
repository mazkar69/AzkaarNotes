# Nginx Server Configuration for Redirecting www to Non-www

This guide provides an optimized Nginx configuration to redirect traffic from `www.yourdomain.com` to `yourdomain.com`. This ensures a consistent URL structure and avoids duplicate content issues.

## Standard Configuration
```nginx
server {
    listen 80;
    server_name www.yourdomain.com;

    # Redirect www to non-www
    return 301 $scheme://yourdomain.com$request_uri;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Your regular server configuration goes here
    # ...
}
```

## Optimized Configuration (Single Block)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    if ($host = www.yourdomain.com) {
        return 301 $scheme://yourdomain.com$request_uri;
    }

    # Your regular server configuration goes here
    # ...
}
```

