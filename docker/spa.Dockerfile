# syntax=docker/dockerfile:1.10.0

ARG SYSTEM
ARG API_URL

FROM node:18-alpine as build-stage
ARG SYSTEM
ARG API_URL

WORKDIR /app

# Get npm registry token (and validate that one was passed to the build using --secret id=NPM_TOKEN )
RUN --mount=type=secret,id=NPM_TOKEN,env=NPM_TOKEN \
    test -n "NPM_TOKEN" || (echo "Build secret \"NPM_TOKEN\" needs to be set. See https://docs.docker.com/build/building/secrets" && false)

# Set npm registry access to the gitlab registry
RUN --mount=type=secret,id=NPM_TOKEN,env=NPM_TOKEN \
    npm config set @kibro:registry https://gitlab.kiwis-and-brownies.de/api/v4/packages/npm/ && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/15/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/18/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/19/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/44/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc && \
    echo "//gitlab.kiwis-and-brownies.de/api/v4/projects/58/packages/npm/:_authToken=${NPM_TOKEN}" >> ~/.npmrc

# Copy required files
COPY package*.json ./
COPY src src
COPY index.html index.html
COPY public public

# Install Deps
RUN npm ci

# Validate required build args
RUN test -n "SYSTEM" || (echo "build-arg \"SYSTEM\" needs to be set to identify which system is supposed to run in here" && false)
RUN test -n "API_URL" || (echo "build-arg \"API_URL\" needs to be set to identify the api url" && false)

# Set required env vars
ENV VITE_APP_SYSTEM=$SYSTEM
ENV VITE_APP_API_URL=$API_URL

# Build
RUN npm run build

# Build final image
FROM nginx:stable-alpine as final
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY docker/spa.nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
