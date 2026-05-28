# Brezel Skeleton

This repository is the starting point for a new Brezel instance.

It gives you a working local setup, a small example system, and a repo-local CLI so you can get from clone to running project quickly.

## Why Brezel

- Fast onboarding: one repo, one setup flow, one foreground control interface.
- Pleasant day-to-day workflow: `brezel serve`, `brezel update`, `brezel apply`, and `brezel load` cover most local work.
- Minimal host setup: install Docker and `mise`, then work through the Brezel CLI. Or use our [one-line-installer](https://gitlab.kiwis-and-brownies.de/kibro/brezel/one-line-installer), then you don't even need to clone this repository manually!

You do **not** need host installations of PHP, Composer, Node, MySQL, or FrankenPHP and we will NOT mess with your local
environment if you have them. All dependencies run in Docker containers, and the Brezel CLI interacts with them for you.

## Quick Start

> The easiest way to get started is to follow the [one-line
> installer](https://gitlab.kiwis-and-brownies.de/kibro/brezel/one-line-installer) instructions, which will set up this
> skeleton for you and run through the initial setup steps automatically.

### Manual Requirements

Install these first:

1. [Docker](https://www.docker.com/)
2. [mise](https://mise.jdx.dev/)

Platform notes:

- On macOS and Linux, the one-line installer can install missing dependencies for you.
- On Windows, **Docker Desktop must already be installed** before you start the Brezel installer. See [Docker Desktop
for Windows](https://docs.docker.com/desktop/windows/install/) for instructions.

### Fast Path

1. Trust and install the local tooling.

```bash
mise trust
mise install
```

2. Run the semantic first-run step. This will ask you what you do and who you are to get a customized and personalized system starting point.

```bash
brezel system initialize
```

3. Run the technical setup flow.

```bash
brezel setup
```

4. Start Brezel manually later with:

```bash
brezel serve
```

Windows PowerShell notes:

- `cmd.exe` is not supported for Brezel commands on Windows.
- `mise` shell aliases are not available in PowerShell.
- Use `.\brezel ...` from the project root, or `mise run <task>`.
- Examples: `.\brezel setup`, `.\brezel serve`, `mise run serve`.

### What To Expect

- `brezel system initialize` asks for your company name and other information. This will determine the name of your
system.
- `brezel setup` prepares `.env`, asks for optional extras, validates dependencies, initializes Brezel, and ends by starting the local environment.
  - > On a fresh machine, first-time setup can take up to 10 minutes on slower hardware or in VMs, especially during the first Docker image build.

Once running, Brezel is available at:

```text
http://<system-identifier>.localhost:<dynamic-port>
```

`brezel serve` prints the exact runtime URL it selected. Brezel prefers the familiar `2040`/`2041`/`2043` range when available and falls back to other free local ports when needed.

## Default Local Users

This skeleton creates two users for local development:

- `dev@example.com`: a root-style development user that bypasses permission checks.
- `admin@example.com`: a normal admin user with full application permissions.

On local development only, both use the password `secret`.

Change these in production via your system `.env`.

## Everyday Usage

### Main Commands

The main commands you will use are:

```bash
brezel serve
brezel update
brezel apply
brezel load
brezel teardown
```

What they do:

- `brezel serve`: start the local stack in the foreground with a clean control view.
- `brezel update`: run migrations, then load workflows, then apply resources.
- `brezel apply`: apply Brezel resource changes.
- `brezel load`: reload workflow definitions.
- `brezel teardown`: stop the stack and remove its containers, volumes, and local Compose images.

If you prefer `mise` tasks, these also work:

```bash
mise run serve
mise run update
mise run apply
mise run load
```

### Foreground Controls

While `brezel serve` is running:

- press `h` to show controls
- press `q` to stop Brezel and clean up
- press `u` for a full update
- press `a` to apply config changes
- press `l` to load workflow changes
- press `e` to explore the database in phpMyAdmin
- press `p` to show all container logs
- press `j` for worker logs
- press `b` to run an arbitrary Bakery command

Stop the normal foreground mode with `Ctrl+C`.

### Interactive Dashboard

If you want the attached Zellij dashboard, use:

```bash
brezel serve interactive
```

It opens panes for:

- SPA / Vite logs
- API / app container logs
- worker logs
- scheduler logs
- dependency bootstrap logs
- a project shell pane

Important:

- Exit the interactive Zellij session with `Ctrl+Q` for a clean shutdown.
- Killing the terminal abruptly can leave orphaned containers behind.

### Rebuilds

To force a rebuild first:

```bash
brezel serve --rebuild
brezel serve interactive --rebuild
```

## Technical Notes

### Dependency Volumes

For better filesystem performance on Windows and macOS:

- `vendor/` is stored in a Docker named volume
- `node_modules/` is stored in a Docker named volume

You may still see empty `vendor/` and `node_modules/` folders on the host.
That is expected: Docker creates those mount points so the volumes can be attached there inside containers.

`brezel teardown` removes these named volumes too because it runs `docker compose down -v`.

### Local Ports

Preferred local ports:

- `2040`: SPA
- `2041`: API
- `2043`: Brotcast / websocket endpoint
- `2044`: phpMyAdmin via `brezel explore-db`

Brezel uses these ports when they are free. If another local stack is already using them, `brezel serve` automatically selects other free ports for the user-facing services.

MariaDB is kept on the internal Docker network and is not published to the host by default.

## Systems and Configuration

The directory `systems/example` contains `.bake` configuration for the example system included with this skeleton.

Use:

```bash
brezel update
```

to sync it into the database and apply the current system state.

Use `.env.example` as the template for local configuration and `.env` as your working config.

For a broader list of environment variables, see the [environment variable reference](https://docs.brezel.io/reference/env).
