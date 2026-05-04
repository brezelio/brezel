FROM dunglas/frankenphp:1-php8.4-bookworm

ENV APP_PATH=/var/www/app \
    COMPOSER_ALLOW_SUPERUSER=1

WORKDIR ${APP_PATH}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git openssh-client unzip supervisor mariadb-client \
    && install-php-extensions bcmath exif gd gmp intl mysqli opcache pcntl pdo_mysql sockets zip imagick ssh2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY container/Caddyfile /etc/frankenphp/Caddyfile
COPY container/php.ini /usr/local/etc/php/conf.d/99-brezel.ini
COPY container/supervisord.conf /etc/supervisord.conf

RUN groupadd --gid 1000 brezel \
    && useradd --uid 1000 --gid brezel --create-home --shell /bin/bash brezel \
    && mkdir -p ${APP_PATH} /config/caddy /data/caddy /home/brezel/.config /home/brezel/.local/share \
    && chown -R brezel:brezel ${APP_PATH} /config /data /home/brezel

USER brezel

CMD ["frankenphp", "run", "--config", "/etc/frankenphp/Caddyfile"]
