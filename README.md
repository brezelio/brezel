# Creating a new Brezel
Only relevant if you are in brezel/brezel and want to create a new project
````shell
composer create-project --prefer-dist brezel/brezel mybrezel
````


# Installing a Brezel

## 1. Install project
Install the Brezel instance itself:
````shell
composer install --prefer-dist
````

Install the frontend components:
```shell
npm install
```

### 1.1 Environment setup
Make sure to set the following environment variables accordingly:

```shell
cp .env.example .env;
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

Don't forget to also configure any .env files you might need in `/systems/<system_identifier>`!

### 1.2 Setup brezel and system(s)

----

#### Important: If you had a system with the same identifier installed before you need to clean up your DB first!
Delete ``brezel_api_<system_identifier>`` user and database

----

Generate the key and migrate the meta database:
```shell
php bakery init
```
Create the Brezel instance:
```shell
php bakery system create <system_identifier>
```
When installing updates via composer, make sure to run the migration script afterwards:
```shell
php bakery migrate
```

## 2. Running the System locally
Windows:

Run ``bin/serve_on_windows``

## 3. Working with brezel system(s)
Go to the system directory and place `*.bake.json` files under a directory structure of your choice. Tutorials and information about how to use the Bakery can be found at https://wiki.brezel.io.

Update the whole system:
```shell
./bin/u
```

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
