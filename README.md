# Brezel

## 1. Create project
````shell
composer create-project --prefer-dist brezel/brezel mybrezel
````

## 2. Install project
Install the Brezel instance itself:
````shell
composer install --prefer-dist
````

Install the frontend components:
```shell
npm install
```

### 2.1 Environment setup
Make sure to set the following environment variables accordingly:

```shell
copy('.env.example', '.env');
```

```dotenv
# This URL should point to public/index.php
APP_URL=https://api.example.test

# This URL should point to a brezel/export instance
BREZEL_EXPORT_URL=https://export.cluster01.brezel.io
BREZEL_FILES_THUMBNAILSIZE_MINI=64
BREZEL_FILES_THUMBNAILSIZE_DEFAULT=256
BREZEL_HIDE_PROGRESS_BAR=false
BREZEL_SSG_PATH_HUGO=hugo

TENANCY_HOST=127.0.0.1   # database host
TENANCY_PORT=3306        # database port
TENANCY_DATABASE=brezel  # meta database for multiple brezel instances
TENANCY_USERNAME=brezel  # database user
TENANCY_PASSWORD=secret  # database password

# This URL should point to public/index.php
VUE_APP_API_URL=https://api.example.test
# The name of the system your frontend is connected to
# If you leave this empty, you must set the parameter in main.js yourself
VUE_APP_SYSTEM=example
```

### 2.2 Setup Brezel and System(s)
Generate the key and migrate the meta database:
```shell
php bakery init
```
Create the 3B instance:
```shell
php bakery system create example
```
When installing updates via composer, make sure to run the migration script afterwards:
```shell
php bakery migrate
```

## 3. Working with brezel system(s)
Go to the system directory and place `*.bake.json` files under a directory structure of your choice. Tutorials and information about how to use the Bakery can be found at https://wiki.brezel.io.

Plan your system updates with:
```shell
php bakery plan
```

Apply your system updates with:
```shell
php bakery apply
```

Load your workflow files with:
```shell
php bakery load
```

### 3.1 Compiles and hot-reloads for development
```shell
npm run serve
```

### 3.2 Compiles and minifies for production
```shell
npm run build
```
