FROM registry.gitlab.com/kibro/brezel/api:latest

# Replace app directory with the contents of this instance
RUN rm -rf /app/*
COPY --chown=api:api . /app
COPY --chown=api:api .env.example /app/.env
RUN chown api /app

# Change current user to api
USER api
WORKDIR /app

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD vendor/bin/brezel init && \
    vendor/bin/brezel system create example && \
    vendor/bin/brezel apply && \
    vendor/bin/brezel load && \
    supervisord -c /app/storage/supervisord.conf && \
    php-fpm
