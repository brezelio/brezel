# Brezel Skeleton

This is the skeleton for a Brezel instance.

It represents the latest "recommended" setup for your Brezel Instance repo.

> Note: This is for brezel/api 2.0 with brezel/spa 4.0 and up!
> 
> For the pre PHP 8 versions, please refer to the [1.x branch](https://gitlab.kiwis-and-brownies.de/kibro/brezel/brezel/-/tree/1.x).

It contains a slim `example` system to get you up and running quickly.

Crucially, it creates two users for you to use:
- `dev@ki-bro.com`: A "root" user that bypasses all permission checks. Use it e.g. for Bakery access. Since this user can do everything, but be careful when you test features with it as things that work with this user may not work with other users!
- `admin@ki-bro.com`: A "normal" user with the `admin` role that has permissions for everything. This (or a similar user that is **not** root) should be used for normal development and interactive testing.

> On local development only these users have the password `secret`.
> 
> You can (and should!) change these passwords in a production environment via your systems `.env` file!

## Deployment

Install and operate according to the [Brezel documentation](https://docs.brezel.io/deploy/virtual_server/).

## Local Usage

> If you have "(mise)[https://github.com/jdx/mise]" installed and set up properly in your shell, it will make your life
> easier.
>
> It will automatically set up the correct php and node versions as well as provide you with helpful commands for common
> operations.
> 
> e.g. `mise run install` to install both composer and npm packages in one, `mise run apply` for a quick bakery apply,
> `mise run update` for an update, `mise run load` to reload workflows.
> Most importantly, `mise run serve` will start a (zellij)[https://zellij.dev/] session with all the necessary servers
> needed to run brezel in the foreground.
> This way, you can monitor what is running and (more importantly) quit / stop them all at once by just exiting zellij.
>
> With the correct runner integration in your IDE you can have native access to these mise tasks as well, right from 
> your fingertips.

### Install or update the Brezel components

Install composer packages:

```bash
composer update
```

Install NPM packages:

```bash
npm install
```

### Create the Database

Create a new MySQL database called `brezel_meta_<some-name>`. This will be the meta database for one or more Brezel systems. In MySQL, execute the following command:

```mysql
CREATE DATABASE brezel_meta_<some-name>
```

### Configure your Brezel environment

Copy the `.env.example` file to `.env` and edit the `.env` file.

For a (mostly) complete list of settable environment variables, consult the [environment variable reference](https://docs.brezel.io/reference/env/#_top). 
More details are in the .env.example file.

To get started, make sure to set the following variables:

##### General settings

```dotenv
APP_URL="http://mybrezel.test"
```

##### SPA settings

Note: variables that are prefixed with `VITE_` are baked into client JS scripts.

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

The directory `systems/example` holds `.bake`-configuration files for a system called `example`. 
`bin/u` will sync these to the DB and build your system.
If you did not change any workflows and only want to update .bake configurations like modules or entities, use the bakery planner:

```bash
php bakery apply
```

To just see what Brezel plans to change, do:

```bash
php bakery plan
```

To update workflows, run:
```bash
php bakery load
```

### Set up your local Dev environment

#### macOS, Linux

You can use Laravel Valet to serve the API (or `php brezel serve`).

The SPA is served on port 8080 by the `npm run serve` command.

You will need to run the queues and websocket server in the background.
```bash
php bakery queue:work
php bakery queue:work --queue=brotcasts
php bakery brotcast:start
```

If you want to have local ``event/cron`` elements working, you will have to run `php bakery schedule` every 60 seconds.

#### Windows

You can use the same `php bakery serve` / `npm run serve` commands as on macOS and Linux, but that will be slow as your API will only be able to work on one request at a time.

A better and faster approach is to use nginx and the included script.
For that, install nginx in your path and make sure that both `gcm nginx` and `gcm php-cgi` find the correct executables.
Go to the Brezel directory and run the following script on the Windows terminal:

```bash
bin\serve_on_windows.ps1
```

> If you just want the benefits of an all-in-one script, but don't want to use nginx, you can run it with`./bin/serve_on_windows.ps1 $true` to disable nginx.
