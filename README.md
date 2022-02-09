# 0. Creating a new Brezel

*Only relevant if you are in brezel/brezel and want to create a new project.*

````shell
composer create-project --prefer-dist brezel/brezel mybrezel
````

*Change the defaults in .env.example to system specific values.*  
*Also update the README (e.g. replace <system_identifier> and <repo_identifier>)*

# 1. Installation

## 1.1. Libraries

````shell
composer install --prefer-dist
npm install
````

## 1.2. Environment setup

```shell
cp .env.example .env;
```

Make sure to set the following environment variables accordingly.

```dotenv
# General settings
APP_URL="https://<repo_identifier>.test" # macOS example
APP_URL="http://localhost" # windows example

# Frontend env
VUE_APP_API_URL="https://<repo_identifier>.test" # macOS example
VUE_APP_API_URL="http://localhost" # windows example

# Brezel settings
BREZEL_EXPORT_URL="https://export.cluster01.brezel.io" # prod url: can be used if this service is not installed locally

# Database settings
TENANCY_USERNAME="<username>"
TENANCY_PASSWORD="<password>"

# Standard mail settings
MAIL_USERNAME=<mailtrap_username>
MAIL_PASSWORD=<mailtrap_password>
```

*Don't forget to also set up the .env in ``/systems/<system_identifier>``!*

## 1.3. Setup brezel and system(s)

----

## 1.3.1. (important) (optional) DB cleanup

If you had the system installed before you need to clean up your DB first.

Delete ``brezel_api_<system_identifier>`` user and database

## 1.3.2. Initialize DB

Create the meta database, that is used for multiple (or one) brezel instance(s).

```mysql
CREATE DATABASE brezel_<system_identifier>_meta
```

Generate the key and migrate the meta database.

```shell
php bakery init
```

Create the instance.

```shell
php bakery system create <system_identifier>
```

# 2. Working with brezel system(s)

## 2.1. Running locally

**macOS**  
Set up the api via valet.  
Run ``bin/serve``

**Linux**  
Set up the api hosting.  
Run ``npm run serve``

**Windows**  
Run ``bin/serve_on_windows``

## 2.2. Make changes

Go to the system directory and place `*.bake.json` files under a directory structure of your choice. Tutorials and
information about how to use the Bakery can be found at https://wiki.brezel.io.

Simply update the whole system.

```shell
./bin/u
```

(optional) Plan your system updates.

```shell
php bakery plan
```

Apply your system updates.

```shell
php bakery apply
```

Load your workflow files.

```shell
php bakery load
```

(optional) When installing updates via composer, make sure to run the migration script afterwards.

```shell
php bakery migrate
```
