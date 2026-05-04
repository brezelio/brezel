# Brezel Skeleton

This is the skeleton for a Brezel instance.

It represents the latest "recommended" setup for your Brezel Instance repo.

> Note: This is for brezel/api 4.0 with brezel/spa ?.0 and up!

It contains a slim `example` system to get you up and running quickly.

Crucially, it creates two users for you to use:
- `dev@example.com`: A "root" user that bypasses all permission checks. Use it e.g. for Bakery access. Since this user can do everything, but be careful when you test features with it as things that work with this user may not work with other users!
- `admin@example.com`: A "normal" user with the `admin` role that has permissions for everything. This (or a similar user that is **not** root) should be used for normal development and interactive testing.

> On local development only these users have the password `secret`.
> 
> You can (and should!) change these passwords in a production environment via your systems `.env` file!

## Quick Start

Install these on your machine first:

1. [Docker](https://www.docker.com/)
2. [mise](https://mise.jdx.dev/)

### 1. Trust and install the local tooling

```bash
mise trust
mise install
```

This installs the small project-local interaction tools only:

- `bun`
- `zellij`

Those power the repo-shipped `brezel` CLI and the local dashboard.

### 2. Run the setup entrypoint

```bash
brezel setup
```

`brezel setup` handles the guided local setup flow.

It will:

- copy `.env.example` to `.env` when needed
- ask for package registry access tokens used by Brezel
- ask for AI connection info and similar extras when configured
- validate the setup by actually trying to use the dependency containers

### 3. Start Brezel

```bash
brezel serve
```

This will:

- clean up any old stack for this project
- check that the required local ports are free
- start the Docker services
- open a Zellij dashboard attached to the live container outputs

> **Important:** Exit the Zellij session with `Ctrl+Q` for a clean shutdown.
> If you just kill the terminal window or otherwise leave the session abruptly, you may leave orphaned containers behind.

## Why This Setup Is Nice

You only need two real machine-wide dependencies:

- [Docker](https://www.docker.com/)
- [mise](https://mise.jdx.dev/)

And only two project-local helper tools:

- `bun`
- `zellij`

Everything else runs inside containers:

- PHP
- FrankenPHP
- Composer
- Node/Vite
- MariaDB
- workers
- scheduler

So you do **not** need a host PHP, Node, Composer, MySQL, or FrankenPHP installation for normal local work.

## Everyday Usage

The main project interaction commands are now:

```bash
brezel apply
brezel load
brezel update
```

What they do:

- `brezel apply`: apply Brezel resource changes
- `brezel load`: reload workflow definitions
- `brezel update`: run migrations, then load, then apply

If you prefer the `mise` task aliases, these still work too:

- `a` for apply
- `l` for load
- `u` for update

Or explicitly:

```bash
mise run apply
mise run load
mise run update
```

For direct Bakery commands inside the app container:

```bash
brezel bakery plan
brezel bakery system create example
brezel bakery init
```

## Zellij Dashboard

`brezel serve` opens a Zellij session with attached panes so you can see what the local stack is doing.

The panes are:

- `spa`: Vite / SPA logs
- `api`: FrankenPHP / app container logs
- `workers`: worker and brotcast logs from the supervised workers container
- `project`: your interactive shell in the project directory
- `bootstrap`: one-shot dependency container logs (`deps` and `node_deps`)
- `scheduler`: scheduler logs

The interactive shell pane also prints the `Ctrl+Q` reminder when the session starts.

## Ports

The default local ports are:

- `2040`: SPA
- `2041`: API
- `2042`: MariaDB
- `2043`: Brotcast / websocket endpoint

## Systems and Example Data

The directory `systems/example` holds `.bake` configuration for a system called `example`.

Use:

```bash
brezel update
```

to sync it to the database and build the current system state.

## Environment

Use `.env.example` as the reference template and `.env` as your local working config.

For a broader list of Brezel environment variables, consult the [environment variable reference](https://docs.brezel.io/reference/env/#_top).

## Deployment

TBD
