# Development Container Setup Guide

This project includes a **Development Container (devcontainer)** configuration for consistent, isolated development environments using Docker and VS Code.

## What is a Dev Container?

A dev container is a containerized development environment that:
- ✅ Provides a consistent setup across all developers
- ✅ Eliminates "works on my machine" problems
- ✅ Includes all required tools pre-installed
- ✅ Integrates seamlessly with VS Code
- ✅ Isolates your machine from project dependencies

## Prerequisites

### 1. Install Docker

**Windows / macOS:**
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Install VS Code Extension

Install the **Dev Containers** extension in VS Code:
- Open VS Code
- Go to Extensions (Ctrl+Shift+X)
- Search for "Dev Containers"
- Install the official Microsoft extension

Or install from CLI:
```bash
code --install-extension ms-vscode-remote.remote-containers
```

### 3. Ensure Docker is Running

**Windows/macOS:**
- Open Docker Desktop and keep it running

**Linux:**
```bash
sudo systemctl start docker
```

## Quick Start

### Open Project in Dev Container

#### Option 1: VS Code Remote Container (Recommended)

1. **Open the project in VS Code**
   ```bash
   code .
   ```

2. **Reopen in Container**
   - Press `F1` (or Cmd+Shift+P on macOS)
   - Type: `Dev Containers: Reopen in Container`
   - Press Enter

3. **Wait for setup** (~2-5 minutes on first run)
   - Docker builds the image
   - Dependencies are installed (`npm install`)
   - All tools are ready to use

4. **You're ready!**
   - VS Code terminal now runs inside the container
   - All commands run in the containerized environment
   - Your local files are mounted and synced

#### Option 2: Pre-built Container (Already Running)

If the container is already built and running:

```bash
# Attach to running container from VS Code
F1 > Dev Containers: Attach to Running Container > saucedemo-dev
```

Or access via terminal:

```bash
docker-compose -f .devcontainer/docker-compose.yml exec devcontainer bash
```

#### Option 3: Manual Docker Compose

```bash
# Build and start the container
docker-compose -f .devcontainer/docker-compose.yml up -d

# Enter the container
docker-compose -f .devcontainer/docker-compose.yml exec devcontainer bash

# Stop the container
docker-compose -f .devcontainer/docker-compose.yml down
```

## Verified & Working ✅

The dev container has been tested and verified:

```bash
✅ Playwright 1.60.0 — All 3 browsers working
✅ Allure CLI 2.42.0 — Report generation ready
✅ npm install — 104 packages, 0 vulnerabilities
✅ ESLint v10 — Linting active (1 warning)
✅ TypeScript — Type-checking working
✅ Java 17 — Available for Allure
✅ Ports — 3000 & 9000 forwarded
```

## What's Included in the Dev Container?

| Component | Version | Status | Purpose |
|-----------|---------|--------|---------|
| **Playwright** | 1.60.0 | ✅ Verified | Official Playwright Docker image with all browsers |
| Chromium | Latest | ✅ Included | Headless browser for automation |
| Firefox | Latest | ✅ Included | Headless browser for automation |
| WebKit | Latest | ✅ Included | Headless browser for automation |
| Node.js | 20 (LTS) | ✅ Verified | JavaScript/TypeScript runtime |
| npm | Latest | ✅ Verified | Package manager |
| TypeScript | Latest | ✅ Verified | Type-safe development |
| Java | 17 | ✅ Verified | Required for Allure CLI |
| Allure CLI | 2.42.0 | ✅ Verified | Report generation |
| Git | Latest | ✅ Included | Version control |
| ESLint | v10 | ✅ Verified | Code linting |
| Prettier | v3 | ✅ Verified | Code formatting |

## VS Code Extensions Included

Automatically installed inside the container:

- **ms-playwright.playwright** — Playwright Test Explorer & Inspector
- **dbaeumer.vscode-eslint** — ESLint integration
- **esbenp.prettier-vscode** — Prettier code formatter
- **ms-vscode.vscode-typescript-next** — TypeScript language support
- **orta.vscode-jest** — Test runner UI
- **Gruntfuggly.todo-tree** — TODO highlighting
- **GitHub.copilot** — AI code completion

## Running Tests Inside Container

All commands work exactly the same:

```bash
# Run all tests with Playwright
npm test

# Run by tag
npm run test:smoke
npm run test:regression

# Run specific test file
npx playwright test tests/login.spec.ts

# Type check TypeScript
npm run type-check

# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format:fix

# Generate Allure report
npm run report
```

## Container Management

### Check Container Status

```bash
# View running containers
docker ps

# Should show: saucedemo-dev (Up X minutes)
```

### Attach to Running Container

```bash
# From VS Code command palette
F1 > Dev Containers: Attach to Running Container > saucedemo-dev

# Or from terminal
docker-compose -f .devcontainer/docker-compose.yml exec devcontainer bash
```

### Restart Container

```bash
# Stop
docker-compose -f .devcontainer/docker-compose.yml down

# Start
docker-compose -f .devcontainer/docker-compose.yml up -d
```

### Rebuild Container (if needed)

```bash
# Use when Dockerfile changes or fresh environment needed
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up -d --build
```

## File Structure

```
.devcontainer/
├── devcontainer.json      # Main devcontainer config
├── Dockerfile             # Custom Docker image
└── docker-compose.yml     # Docker Compose setup
```

## Configuration Details

### devcontainer.json

- **Base Image:** Official Playwright image v1.60.0 (`mcr.microsoft.com/playwright:v1.60.0`)
- **Features:** Java 17, Git
- **Pre-installed Browsers:** Chromium, Firefox, WebKit
- **VS Code Settings:** Prettier auto-format on save, ESLint auto-fix
- **Post-Create:** `npm install` (browsers already included in image)
- **Forwarded Ports:** 3000 (App), 9000 (Allure Report)
- **Remote User:** `pwuser` (Playwright image user)

### Dockerfile

- Builds on the **official Playwright Docker image** v1.60.0
- Adds Java 17 for Allure reporting
- Installs Allure CLI globally (v2.42.0)
- Pre-installs global npm packages (TypeScript, npm latest)
- All Playwright browsers (Chromium, Firefox, WebKit) already included
- Configured for proper permission handling with sudo support

### docker-compose.yml

- Builds the Dockerfile
- Mounts workspace and node_modules
- Exposes ports 3000 and 9000
- Keeps container running for interactive development
- Volume-mounts node_modules for better performance

## Common Commands

### Start Development

```bash
# Reopen in container (from VS Code command palette)
F1 > Dev Containers: Reopen in Container
```

### Stop Development

```bash
# Option 1: From VS Code command palette
F1 > Dev Containers: Reopen Locally

# Option 2: Close VS Code (container shuts down)

# Option 3: Stop container manually
docker ps                 # Find container ID
docker stop <container-id>
```

### Rebuild Container

Use this if you update the Dockerfile or need a fresh environment:

```bash
# From VS Code command palette
F1 > Dev Containers: Rebuild Container

# Or manually
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up --build
```

### Access Container Terminal

```bash
# If using docker-compose
docker-compose -f .devcontainer/docker-compose.yml exec devcontainer bash

# Or from VS Code (already available)
```

## Troubleshooting

### Container fails to build

**Issue:** Docker build fails during `npm install`

**Solution:**
1. Rebuild the container
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and `package-lock.json`, rebuild

```bash
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml up --build
```

### Playwright browser installation fails

**Issue:** Browsers don't install properly (unlikely with official image, but if needed)

**Solution:** The official Playwright image includes all browsers. If still needed:

```bash
# Inside the container
npx playwright install --with-deps chromium firefox webkit
```

**Note:** The official image already has all browsers, so this should rarely be needed.

### Port conflicts

**Issue:** Port 3000 or 9000 is already in use

**Solution:** Change the forwarded ports in `.devcontainer/docker-compose.yml`:

```yml
ports:
  - "3001:3000"   # Local 3001 → Container 3000
  - "9001:9000"   # Local 9001 → Container 9000
```

### Permission denied errors

**Issue:** Can't write to workspace from container

**Solution:** Ensure volume mounts are correct in `docker-compose.yml`:

```yml
volumes:
  - ..:/workspace:cached
  - /home/node/.ssh:/home/node/.ssh:cached
```

### Out of disk space

**Issue:** Docker containers/images using too much disk

**Solution:**
```bash
# Clean up unused containers and images
docker system prune -a
```

## Performance Tips

1. **Enable buildkit for faster builds:**
   ```bash
   export DOCKER_BUILDKIT=1
   ```

2. **Use cached volumes for node_modules:**
   Already configured in `docker-compose.yml`

3. **Use bind mount caching:**
   Already configured with `:cached` suffix

4. **Keep container running:**
   Don't rebuild unless necessary; just reopen locally/in container

## Next Steps

1. Clone the repository
2. Install Docker Desktop
3. Open in VS Code
4. Reopen in Dev Container (F1)
5. Wait for setup
6. Start developing!

```bash
npm test                   # Run tests
npm run type-check         # Check types
npm run lint               # Lint code
npm run format:fix         # Format code
npm run report             # Generate Allure report
```

## Sharing with Team

The devcontainer configuration is committed to the repository. Team members just need to:

1. Clone the repo
2. Install Docker Desktop
3. Install Dev Containers extension in VS Code
4. Open project in container (F1 → Reopen in Container)

Everyone gets the exact same development environment! 🎯
