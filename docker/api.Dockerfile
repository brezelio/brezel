# syntax=docker/dockerfile:1.10.0

# Args for the build
ARG SYSTEM
ARG PHP_MEMORY_LIMIT=1G
ARG COMPOSER_USER

# Technical Args
ARG PHP_VERSION=8.4-fpm
ARG PHP_BASE_IMAGE=php:${PHP_VERSION}-alpine

# First, we build a layer with the system dependencies and php extensions.
FROM $PHP_BASE_IMAGE AS system

# Fail early if the (floating) base image tag resolves to an unpatched PHP release.
# One minimum patch version per supported minor branch.
ARG PHP_MIN_VERSIONS="8.4.27 8.5.12"
RUN php <<'EOF'
<?php
$branch = PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION;
foreach (explode(' ', getenv('PHP_MIN_VERSIONS')) as $min) {
  if (!str_starts_with($min, $branch . '.')) {
    continue;
  }
  if (version_compare(PHP_VERSION, $min, '<')) {
    fwrite(STDERR, 'PHP ' . PHP_VERSION . " is older than the required $min. Pull a newer base image (docker build --pull)." . PHP_EOL);
    exit(1);
  }
  exit(0);
}
fwrite(STDERR, "No minimum patch version configured for PHP $branch in PHP_MIN_VERSIONS." . PHP_EOL);
exit(1);
EOF

# Install dependencies
RUN apk add --no-cache \
  # Just to debug
  vim \
  # Installs the mysql client to interact with the database
  mysql-client \
  # Needed to connect to mysql 8
  mariadb-connector-c-dev \
  # Needed for supervisor
  supervisor \
  # For nginx
  nginx \
  # Full ICU locale data, required for PHP Intl/Twig to format currencies with locales such as de_DE
  icu-data-full

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
RUN docker-php-ext-install pdo_mysql mysqli zip exif pcntl bcmath sockets gmp sodium opcache calendar

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
  && curl -L -o /tmp/imagick.tar.gz https://github.com/Imagick/imagick/archive/tags/3.7.0.tar.gz \
  && tar --strip-components=1 -xf /tmp/imagick.tar.gz \
  && sed -i 's/php_strtolower/zend_str_tolower/g' imagick.c \
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
FROM system AS composer

# Will be used if set to define the user composer should use to access brezel/api
ARG COMPOSER_USER

# Create workdir and set permissions
WORKDIR /app
RUN chown -R www-data:www-data /app

# Install composer dependencies first, so this layer can be cached
COPY --chown=www-data:www-data composer.json composer.json
COPY --chown=www-data:www-data composer.lock composer.lock

# Set the user to www-data temporarily for running composer
USER www-data

# Get composer token (and validate that one was passed to the build using --secret id=COMPOSER_TOKEN )
RUN --mount=type=secret,id=COMPOSER_TOKEN,env=COMPOSER_TOKEN \
  test -n "$COMPOSER_TOKEN" || (echo "Build secret \"COMPOSER_TOKEN\" needs to be set. See https://docs.docker.com/build/building/secrets" && false)

# Set the composer token and install dependencies without dev deps
RUN --mount=type=secret,id=COMPOSER_TOKEN,env=COMPOSER_TOKEN \
  composer config gitlab-token.gitlab.kiwis-and-brownies.de $COMPOSER_USER "$COMPOSER_TOKEN" && \
  composer install --no-interaction --no-scripts --no-dev --optimize-autoloader && \
  # composer config writes the token to ./auth.json, which must not end up in the image
  rm -f auth.json

# Now run composer cleanup script to cleanup dependencies e.g. remove 100MB of Google apis...
RUN composer run cleanup-dependencies --no-interaction

# Switch back to root user
USER root

# Increase memory limit by reusing the arg defined above (for both the API and brotcast)
ARG PHP_MEMORY_LIMIT
RUN echo "memory_limit = $PHP_MEMORY_LIMIT" >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini;

# Some optional application files are copied with a one-character glob (e.g. `ap[p]`), so missing paths are skipped instead of failing the build.

# Additionally install the dev dependencies for running tests (see the validate target)
FROM composer AS composer-validate

ARG COMPOSER_USER

USER www-data

RUN --mount=type=secret,id=COMPOSER_TOKEN,env=COMPOSER_TOKEN \
  composer config gitlab-token.gitlab.kiwis-and-brownies.de $COMPOSER_USER "$COMPOSER_TOKEN" && \
  composer install --no-interaction --no-scripts --optimize-autoloader && \
  rm -f auth.json

USER root

FROM composer AS brotcast

WORKDIR /app

# Copy files relevant for the brotcast service via reverb
COPY --chown=www-data:www-data ap[p] app
COPY --chown=www-data:www-data bakery bakery
COPY --chown=www-data:www-data bootstrap bootstrap
COPY --chown=www-data:www-data resource[s] resources

EXPOSE 8086

CMD ["php", "bakery", "brotcast:start"]

FROM composer AS system-files
WORKDIR /app

# Copy the the application files
COPY --chown=www-data:www-data --chmod=0755 bin bin
COPY --chown=www-data:www-data ap[p] app
COPY --chown=www-data:www-data bakery bakery
COPY --chown=www-data:www-data bootstrap bootstrap
COPY --chown=www-data:www-data resource[s] resources
COPY --chown=www-data:www-data systems systems
COPY --chown=www-data:www-data storag[e] storage
COPY --chown=www-data:www-data publi[c] public
COPY --chown=www-data:www-data server.php server.php
COPY --chown=www-data:www-data README.m[d] README.md

# Remove .env to only use passed values
RUN rm .env || true

# Image for running tests, e.g. `docker run --rm <image> vendor/bin/phpunit`
FROM system-files AS validate

COPY --chown=www-data:www-data --from=composer-validate /app/vendor vendor
COPY --chown=www-data:www-data test[s] tests
COPY --chown=www-data:www-data phpunit.xm[l] phpunit.xml

USER www-data

CMD ["vendor/bin/phpunit"]

FROM system-files AS final

# Configure php and php-fpm
RUN echo "pm = dynamic" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.max_children = 300" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.max_requests = 1500 ; Restart worker after X requests to prevent memory leaks" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.start_servers = 10" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.min_spare_servers = 10" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.max_spare_servers = 50" >> /usr/local/etc/php-fpm.conf && \
  echo "pm.process_idle_timeout = 15s" >> /usr/local/etc/php-fpm.conf && \
  # Omit URLs from the access log entirely: paths can contain share tokens, not just query strings.
  # PHP memory is the peak PHP allocation, not worker RSS.
  echo 'access.format = "fpm_access pid=%p method=%m status=%s duration_ms=%{milliseconds}d peak_php_memory_kib=%{kilobytes}M cpu_pct=%C"' >> /usr/local/etc/php-fpm.conf && \
  echo "opcache.enable_cli = 1" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.enable = 1" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.memory_consumption = 192" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.interned_strings_buffer = 16" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.max_accelerated_files = 10000" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.revalidate_freq = 0" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.validate_timestamps = 1" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.max_wasted_percentage = 10" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "opcache.fast_shutdown = 1" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "upload_max_filesize = 25M" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "post_max_size = 25M" >> /usr/local/etc/php/conf.d/docker-php-perf.ini && \
  echo "expose_php = Off" >> /usr/local/etc/php/conf.d/docker-php-security.ini && \
  echo "disable_functions = passthru,shell_exec,system ; we need exec for file merging. passthru is technically also used, but only for the dev server so we can safely disable it" >> /usr/local/etc/php/conf.d/docker-php-security.ini && \
  # PHP's production defaults: do not report deprecations and never display errors to clients
  echo "error_reporting = E_ALL & ~E_DEPRECATED" >> /usr/local/etc/php/conf.d/docker-php-errors.ini && \
  echo "display_errors = Off" >> /usr/local/etc/php/conf.d/docker-php-errors.ini

# Get nginx configuration
COPY docker/api.nginx.conf nginx.conf

# Get supervisor
COPY docker/supervisord.conf /app/supervisord.conf

# Register cron
RUN mkdir -p /etc/cron
RUN echo "* * * * * cd /app && BREZEL_ENV_DIR=storage php bakery schedule >> /dev/null 2>&1" > /etc/cron/crontab
RUN chmod 0644 /etc/cron/crontab
RUN crontab -u www-data /etc/cron/crontab

# Expose port 9000 for php-fpm
EXPOSE 9000

# Expose port 80 for nginx
EXPOSE 80

# Reuse SYSTEM build arg
ARG SYSTEM

# Validate that the system build arg is set
RUN test -n "SYSTEM" || (echo "build-arg \"SYSTEM\" needs to be set to identify which system is supposed to run in here" && false)

# Write the system identifier to a file to be reused by the start script
RUN echo "$SYSTEM" > /app/.system

# Get the start script
COPY --chmod=0755 ../docker/start.sh start.sh

# Start the system
CMD ["ash", "start.sh"]
