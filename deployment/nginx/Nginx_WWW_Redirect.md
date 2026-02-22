# Nginx WWW Redirects Configuration Guide

This guide provides Nginx configurations for handling WWW redirects in both directions. Choose the configuration based on your preferred URL structure to ensure consistency and avoid duplicate content issues.

## Option 1: Redirect WWW to Non-WWW

### Standard Configuration (Separate Blocks)
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

### Optimized Configuration (Single Block)
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

## Option 2: Redirect Non-WWW to WWW

### Standard Configuration (Separate Blocks)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect non-www to www
    return 301 $scheme://www.yourdomain.com$request_uri;
}

server {
    listen 80;
    server_name www.yourdomain.com;

    # Your regular server configuration goes here
    # ...
}
```

### Optimized Configuration (Single Block)
```nginx
server {
    listen 80;
    server_name www.yourdomain.com yourdomain.com;

    if ($host = yourdomain.com) {
        return 301 $scheme://www.yourdomain.com$request_uri;
    }

    # Your regular server configuration goes here
    # ...
}
```



## Testing Your Configuration

### Test the Redirect
```sh
Syntax:- curl -I http://SOURCE_DOMAIN
Example:- curl -I http://www.yourdomain.com
```

### Verify Final URL
```sh
Syntax:- curl -L http://SOURCE_DOMAIN
Example:- curl -L http://www.yourdomain.com
```

### Check with Different Paths
```sh
Syntax:- curl -I http://SOURCE_DOMAIN/test-path
Example:- curl -I http://www.yourdomain.com/about-us
```

## Apply Configuration

### Reload Nginx
```sh
sudo nginx -t
sudo systemctl reload nginx
```

## Best Practices

1. **Choose One Direction**: Stick with either www or non-www consistently across your site
2. **Update Internal Links**: Make sure all internal links use your preferred format
3. **Update Canonical Tags**: Ensure HTML canonical tags match your redirect preference
4. **Update Analytics**: Configure Google Analytics and other tools with your preferred domain format
5. **Test Thoroughly**: Test redirects with various paths and query parameters

