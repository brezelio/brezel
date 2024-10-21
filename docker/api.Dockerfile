ARG PHP_VERSION=8.3-fpm
ARG PHP_MEMORY_LIMIT=1G

# First, we build a layer with the system dependencies and php extensions.
ARG PHP_BASE_IMAGE=php:${PHP_VERSION}-alpine
FROM $PHP_BASE_IMAGE as system

# Install dependencies
RUN apk add --no-cache \
    # Just to debug
    vim \
    # Installs the mysql client to interact with the database
    mysql-client \
    # Needed to connect to mysql 8
    mariadb-connector-c-dev

# System level application dependencies for php extensions
RUN apk add --no-cache \
    # Needed for guzzle
    curl \
    # To fix a warning about unzip missing and possibly causing corruption
    unzip \
    # For pdf file merging
    ghostscript \
    # For zip extension
    libzip-dev \
    # For php extension gmp
    gmp-dev \
    # For php extension sodium
    libsodium-dev

# Build deps that can be removed later
RUN apk add --no-cache --virtual .build-deps \
    # Needed for pecl & imagick
    $PHPIZE_DEPS \
    # Required to compile native dependencies like gd or intl
    build-base \
    # Needed to build php extensions like sockets or xdebug on alpine
    linux-headers

# base php extensions
RUN docker-php-ext-install pdo_mysql mysqli zip exif pcntl bcmath sockets gmp sodium

# imap
RUN apk add --no-cache openssl-dev imap-dev krb5-dev \
    && docker-php-ext-configure imap --with-kerberos --with-imap-ssl \
    && docker-php-ext-install imap

# intl
RUN apk add --no-cache icu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl

# gd
RUN apk add --no-cache freetype-dev libjpeg-turbo-dev libpng-dev \
    && docker-php-ext-configure gd --with-freetype=/usr/include/ --with-jpeg=/usr/include/ \
    && docker-php-ext-install gd

# imagick
# Imagick is installed from the archive because regular installation fails
# See: https://github.com/Imagick/imagick/issues/643#issuecomment-1834361716
RUN apk add --no-cache imagemagick imagemagick-dev \
    && curl -L -o /tmp/imagick.tar.gz https://github.com/Imagick/imagick/archive/refs/tags/3.7.0.tar.gz \
    && tar --strip-components=1 -xf /tmp/imagick.tar.gz \
    && phpize \
    && ./configure \
    && make \
    && make install \
    && echo "extension=imagick.so" > /usr/local/etc/php/conf.d/ext-imagick.ini \
    && rm -rf /tmp/*

# Set ImageMagick PDF policy (https://stackoverflow.com/a/53379341)
ARG imagemagic_config=/etc/ImageMagick-6/policy.xml
RUN if [ -f $imagemagic_config ] ; then sed -i 's/<policy domain="coder" rights="none" pattern="PDF" \/>/<policy domain="coder" rights="read|write" pattern="PDF" \/>/g' $imagemagic_config ; else echo did not see file $imagemagic_config ; fi

# Install composer
COPY --chown=www-data:www-data --from=docker.io/composer/composer:latest-bin /composer /usr/bin/composer

# Cleanup all the deps we only needed for building native php extensions
RUN apk del .build-deps

# Remove pecl cache
RUN rm -rf /tmp/pear

# Now we build the composer layer
FROM system as composer

# Create workdir and set permissions
WORKDIR /app
RUN chown -R www-data:www-data /app

# Install composer dependencies first, so this layer can be cached
COPY --chown=www-data:www-data composer.json composer.json
COPY --chown=www-data:www-data composer.lock composer.lock

# Set the user to www-data temporarily for running composer
USER www-data

# Install dependencies without dev
RUN composer install --no-interaction --no-scripts --no-dev --optimize-autoloader

# Now run composer cleanup script to cleanup dependencies e.g. remove 100MB of Google apis...
RUN composer run cleanup-dependencies --no-interaction

# Switch back to root user
USER root

FROM composer as final

# Increase memory limit by reusing the arg defined above
ARG PHP_MEMORY_LIMIT
RUN echo "memory_limit = $PHP_MEMORY_LIMIT" >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;

# Copy the the application files
COPY --chown=www-data:www-data --chmod=0755 bin bin
COPY --chown=www-data:www-data bakery bakery
COPY --chown=www-data:www-data bootstrap bootstrap
COPY --chown=www-data:www-data systems systems
COPY --chown=www-data:www-data storage storage
COPY --chown=www-data:www-data public public
COPY --chown=www-data:www-data server.php server.php
COPY --chown=www-data:www-data README.md README.md

# Remove .env to only use passed ones
RUN rm .env || true

# Expose port 9000 for php-fpm
EXPOSE 9000

# Register cron
RUN echo "* * * * * www-data cd /app && BREZEL_ENV_DIR=storage /usr/local/bin/php bakery schedule >> /dev/null 2>&1" > /etc/cron.d/cron
RUN chmod 0644 /etc/cron.d/cron
RUN crontab /etc/cron.d/cron

# Set the user to www-data
USER www-data

# Run migrations & co, register supervisor config and then php-fpm
CMD php bakery init --force && \
    php bakery migrate --force && \
    php bakery system create example && \
    php bakery apply && \
    php bakery load --force && \
    mkdir -p storage/app storage/framework storage/logs && \
    chown -R www-data:www-data storage && \
    php bakery make:supervisor && \
    /usr/bin/supervisord -c /app/supervisord.conf && \
    php-fpm
