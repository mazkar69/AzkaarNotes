# Wordpress installation on Ubuntu
```markdown

# Installing WordPress on Ubuntu

## Step 1: Install Dependencies
To install WordPress on Ubuntu, we need to install the following dependencies:

1. **NGINX Web Server** (as we are using NGINX)
2. Install MySQL Server, PHP-FPM, and PHP-MySQL:
  
   sudo apt install mysql-server php-fpm php-mysql
```
   Ensure all dependencies are installed.

## Step 2: Download and Install WordPress

1. Download WordPress:
   ```bash
   wget https://wordpress.org/latest.tar.gz
   ```
2. Extract WordPress:
   ```bash
   tar -zxvf latest.tar.gz
   ```
3. Move WordPress to the desired directory:
   ```bash
   sudo mv wordpress /var/www/blog/
   ```

Now, WordPress and the server are set up.

## Step 3: Configure NGINX
Add the following script in the NGINX configuration file:

```nginx
location /blog/ {
    root /var/www;
    index index.php;
    try_files $uri $uri/ /blog/index.php?$args;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

Add this configuration in the **sites-enabled** directory.

## Step 4: Setting Up the Database

1. Open MySQL:
   ```bash
   mysql -u root -p
   ```
   (Press Enter without typing a password if no password is set.)

2. Create the database and user:
   ```sql
   CREATE DATABASE wordpress;
   CREATE USER 'wordpressuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpressuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

**Note:** Ensure you replace `'your_password'` with a strong password.

## Step 5: Configuring WordPress

1. Navigate to the WordPress directory:
   ```bash
   cd /var/www/blog
   ```
2. Check for `wp-config.php`. If not present, create it:
   ```bash
   cp wp-config-sample.php wp-config.php
   ```
3. Edit `wp-config.php`:
   ```bash
   nano wp-config.php
   ```
4. Add database details:
   ```php
   define('DB_NAME', 'wordpress');
   define('DB_USER', 'wordpressuser');
   define('DB_PASSWORD', 'your_password');
   ```
5. Generate authentication keys:
   Visit [WordPress Secret Key API](https://api.wordpress.org/secret-key/1.1/salt/) to generate keys and paste them into `wp-config.php`.

## Step 6: Restart Services

```bash
sudo service nginx restart
sudo systemctl restart mysql
```

For more details, check the [AWS WordPress Hosting Guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/hosting-wordpress.html).

## Step 7: Fix Permission Issues
Sometimes, WordPress may require FTP credentials for installing plugins or updates. To fix this:

1. Change ownership:
   ```bash
   sudo chown -R www-data:www-data /var/www/blog
   ```
2. Or edit `wp-config.php` and add:
   ```php
   define('FS_METHOD', 'direct');
   ```

Now, WordPress should work without FTP prompts.
```

