### Install or update the Brezel components

Install composer packages:

```bash
composer install
```

Install NPM packages:

```bash
yarn install
```

On windows you might need to run `yarn install --ignore-engines --ignore-platform` because of old spa dependencies

### Create the Database

Create a new MySQL database called `brezel_meta`. This will be the meta database for one or more Brezel systems. In MySQL, execute the following command:

```mysql
CREATE DATABASE brezel_meta
```

### Configure your Brezel environment

Copy the `.env.example` file to `.env` and edit the `.env` file.

For a full list of settable environment variables, consult the [environment variable reference](https://wiki.brezel.io/docs/configuration/env/). To get started, make sure to set the following variables:

##### General settings

```dotenv
APP_URL="http://mybrezel.test"
```

##### SPA settings

Note: variables that are prefixed with `VUE_` are baked into client JS scripts.

**Do not** put sensitive values here.

```dotenv
APP_URL="http://mybrezel.test"
APP_SYSTEM=example
```

##### Database settings

```dotenv
TENANCY_HOST=127.0.0.1
TENANCY_PORT=3306
TENANCY_DATABASE="brezel_meta"
TENANCY_USERNAME="<user>"
TENANCY_PASSWORD="<password>"
```

##### Brezel settings

```dotenv
BREZEL_EXPORT_URL="https://export.staging.cluster-sw.brezel.io"
```

### Setup your Brezel

Initialize the database:

```bash
php bakery init
```

Create one or more Brezel systems:

```bash
php bakery system create <system>
```

Run ``bin/u`` to apply the current system config.

The corresponding directory `systems/example` can hold `.bake`-configuration files that can be synced to the `example` database. To do this, you can run the following command:

```bash
php bakery apply
```

To just see what Brezel plans to change, do:

```bash
php bakery plan
```

### Set up your web server

##### macOS, Linux

If you used valet in the [webserver setup]({{< ref path="prerequisites.md" >}}):

```bash
valet link
```

Now valet created the symbolic link `mybrezel.test` to your Brezel instance. This is where the Brezel **API** is reachable from now on.

##### Windows

Go to the Brezel directory and run the following script on the Windows terminal:

```bash
bin\serve_on_windows.ps1
```

If you get CORS errors sure that you are running the script without nginx. You can run it with`./bin/serve_on_windows.ps1 $true` to disable nginx.

### Run the SPA service

In the Brezel directory, start the SPA development server:

```bash
npm run serve
```

The service will listen on localhost:8080 or the nearest open port.
