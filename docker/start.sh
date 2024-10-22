#!/bin/bash

echo "Starting cron..."
crond

# Create supervisor config and start it
php bakery make:supervisor
supervisord -c supervisord.conf

# Bakery init for keys and base migrations
php bakery init --force

# Forced bakery migrations for tenant migrations
php bakery migrate --force

# Create system if it does not exist
php bakery system create ${1}

# Apply the plan
php bakery apply

# Load the system (aka workflows)
php bakery load --force

# Make sure the storage directory exists
mkdir -p storage/app storage/framework storage/logs
chown -R www-data:www-data storage

# Output the php-fpm listen directive
echo "php-fpm is configured to listen on:"
php-fpm -tt
echo "now greped"
php-fpm -tt | grep -E "^listen\s*="

# Start php-fpm in the background
php-fpm -D

# Start nginx in the foreground as the main process of this container using the copied config
echo "Starting nginx..."
nginx_path=$(which nginx)
app_root=$(pwd)
nginx -g "daemon off;" -p $nginx_path -e "$app_root/nginxerror.log" -c "$app_root/nginx.conf"
