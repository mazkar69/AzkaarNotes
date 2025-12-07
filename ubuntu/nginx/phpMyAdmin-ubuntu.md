        
## Installing phpMyAdmin on Ubuntu Server [Using this method in wedding banquets]

To install phpMyAdmin on an Ubuntu server, ensure you have the **LEMP** stack (Linux, Nginx, MySQL, and PHP) installed.

### Steps to Install phpMyAdmin

1. Install phpMyAdmin and required dependencies:
   ```sh
   sudo apt install phpmyadmin php-mbstring php-zip php-gd php-json php-curl
   ```

2. During installation:
   - You will be asked to choose a server. **Nginx will not be listed**, so press `Tab` and then `OK`.
   - Confirm the `dbconfig-common` setup.
   - Set a strong password for phpMyAdmin.

3. phpMyAdmin is now installed at:
   ```sh
   /usr/share/phpmyadmin
   ```

4. Create a symbolic link so Nginx can serve phpMyAdmin:
   ```sh
   sudo ln -s /usr/share/phpmyadmin /var/www/html/phpmyadmin
   ```

5. Configure Nginx for phpMyAdmin by editing `/etc/nginx/sites-available/default` or creating a new config file:

   **Standard Configuration:**
   ```nginx
   location /phpmyadmin {
       root /var/www/html;
       index index.php index.html index.htm;

       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
           fastcgi_index index.php;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
           include fastcgi_params;
       }
   }
   ```

   **Using Alias:**
   ```nginx
   location /phpmyadmin {
       alias /var/www/html;
       index index.php index.html index.htm;

       location ~ \.php$ {
           root /var/www/html;
           fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
           fastcgi_index index.php;
           fastcgi_param SCRIPT_FILENAME $request_filename;
           include fastcgi_params;
       }
   }
   ```
   **Note:** Make sure to use the correct PHP version (e.g., `php8.0`).

6. Restart Nginx:
   ```sh
   sudo service nginx restart
   ```

7. Create a MySQL user and grant permissions to access phpMyAdmin:
   ```sql
   CREATE USER 'phpmyadminuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON *.* TO 'phpmyadminuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

8. If phpMyAdmin is not accessible, try the following fixes:
   ```sh
   cd /var/lib/phpmyadmin
   sudo chmod -R 775 tmp
   sudo service nginx restart
   ```

9. Access phpMyAdmin via:
   ```
   https://your_domain_or_IP/phpmyadmin
   ```

