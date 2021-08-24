# Brezel

## Project setup

````shell
composer create-project --prefer-dist brezel/brezel mybrezel
````

Install the frontend components:
```shell
npm install
```

## Env

Make sure to set the following environment variables accordingly:

```dotenv
# This URL should point to public/index.php
APP_URL=https://api.brezel-example.test

# This URL should point to a brezel/export instance
BREZEL_EXPORT_URL=https://export.brezel-example.test
BREZEL_FILES_THUMBNAILSIZE_MINI=64
BREZEL_FILES_THUMBNAILSIZE_DEFAULT=256
BREZEL_HIDE_PROGRESS_BAR=false
BREZEL_SSG_PATH_HUGO=hugo

TENANCY_HOST=127.0.0.1   # database host
TENANCY_PORT=3306        # database port
TENANCY_DATABASE=brezel  # database
TENANCY_USERNAME=brezel  # database user
TENANCY_PASSWORD=secret  # database password

# This URL should point to public/index.php
VUE_APP_API_URL=https://api.brezel-example.test
# The name of the system your frontend is connected to
# If you leave this empty, you must set the parameter in main.js yourself
VUE_APP_SYSTEM=example
```

## Setup Brezel and System(s)
```shell
vendor/bin/brezel init  # this generates an app key and a RSA keypair
vendor/bin/brezel system create example  # this creates a system named "example" and a directory with the same name
```

## Manage your System(s)
Go to the system directory and place `*.bake.json` files under a directory structure of your choice. Tutorials and information about how to use the Bakery can be found at https://wiki.brezel.io.

Plan your system updates with:
```shell
vendor/bin/brezel plan
```

Apply your system updates with:
```shell
vendor/bin/brezel apply
```

Load your workflow files with:
```shell
vendor/bin/brezel load
```

### Compiles and hot-reloads for development
```shell
npm run serve
```

### Compiles and minifies for production
```shell
npm run build
```
