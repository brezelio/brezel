FROM php:7.4-fpm

# Increase memory limit
RUN echo 'memory_limit = 512M' >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;

# Install dependencies
RUN apt-get update
RUN apt-get install -y build-essential
RUN apt-get install -y default-mysql-client
RUN apt-get install -y libpng-dev
RUN apt-get install -y libjpeg62-turbo-dev
RUN apt-get install -y libfreetype6-dev
RUN apt-get install -y locales
RUN apt-get install -y zip
RUN apt-get install -y jpegoptim optipng pngquant gifsicle
RUN apt-get install -y vim
RUN apt-get install -y unzip
RUN apt-get install -y git
RUN apt-get install -y curl
RUN apt-get install -y libzip-dev
RUN apt-get install -y libonig-dev
RUN apt-get install -y libc-client-dev
RUN apt-get install -y libkrb5-dev
RUN apt-get install -y rsync
RUN apt-get install -y supervisor
RUN apt-get install -y nginx

# Install PHP and composer dependencies
RUN apt-get install -qq git curl libmcrypt-dev libjpeg-dev libpng-dev libfreetype6-dev libbz2-dev libjpeg62-turbo-dev

# Install needed extensions
RUN docker-php-ext-configure imap --with-kerberos --with-imap-ssl
RUN docker-php-ext-install pdo_mysql zip exif pcntl gd bcmath sockets imap

# Install composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Clear out the local repository of retrieved package files
RUN apt-get clean

COPY --chown=www-data:www-data . /app
RUN chown -R www-data:www-data /var/www

USER root

WORKDIR /app

RUN rm -rf .env

RUN cp php.ini /usr/local/etc/php/conf.d/app.ini
RUN cp nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80
CMD php bakery init --force && \
    php bakery migrate --force && \
    php bakery system create example && \
    php bakery apply && \
    php bakery load --force && \
    /usr/bin/supervisord -c /app/supervisord.conf -n

