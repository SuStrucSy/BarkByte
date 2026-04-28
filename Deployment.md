# Deploying Full-Stack App to Béluga / Arbutus Cloud (Digital Alliance Canada)

This guide covers deploying a FastAPI + React (Vite) + PostgreSQL stack with Traefik as a reverse proxy on the Digital Alliance Canada OpenStack cloud (Béluga or Arbutus), using **GitHub Actions** for automated CI/CD. Docker images are built in CI and pushed to GitHub Container Registry (GHCR), then pulled on the server at deploy time. Secrets are managed via GitHub and never stored in the repository.

---

## Prerequisites

- Active CCDB account with access to Béluga Cloud
- A domain name (see Pre-Deployment Setup below)
- SSH key pair configured in OpenStack
- Your app repo (based on tiangolo full-stack FastAPI template)
- GitHub repository with Actions enabled

---

## Pre-Deployment Setup

Complete these steps before touching the server. They only need to be done once.

### 1 — Domain

Domain `timverse.ca` is registered and managed directly on Cloudflare.

---

### 2 — Add DNS A Records in Cloudflare

Once your Béluga Cloud VM is running and you have a floating IP, add these records in Cloudflare → **DNS → Records**:

| Name | Type | Value | Proxy Status |
|---|---|---|---|
| `@` | A | `<your-floating-ip>` | ☁️ Proxied (orange cloud) |
| `www` | A | `<your-floating-ip>` | ☁️ Proxied (orange cloud) |
| `api` | A | `<your-floating-ip>` | ☁️ Proxied (orange cloud) |
| `docs` | A | `<your-floating-ip>` | ☁️ Proxied (orange cloud) |
| `traefik` | A | `<your-floating-ip>` | DNS only (grey cloud) |

> `traefik.timverse.ca` stays DNS-only — it's an admin dashboard that doesn't need Cloudflare's CDN and it's simpler to access directly.
>
> All other subdomains are proxied through Cloudflare, giving you DDoS protection, CDN caching, and your real server IP stays hidden. TLS certificates are issued via Let's Encrypt DNS-01 challenge (using the Cloudflare API) so there's no conflict with the proxy.

---

### 3 — Create a Cloudflare API Token

Traefik needs this to create DNS TXT records for Let's Encrypt DNS-01 certificate challenges — this is what allows proxied domains to get valid TLS certs.

1. In Cloudflare → **Profile (top right) → API Tokens → Create Token**
2. Click **Use template** next to **Edit zone DNS**
3. Under **Zone Resources** set: `Include → Specific zone → timverse.ca`
4. Click **Continue to summary → Create Token**
5. Copy the token — you won't see it again

Add it as a GitHub Secret:

| Secret | Value |
|---|---|
| `CF_DNS_API_TOKEN` | *(your Cloudflare API token)* |

Also set **SSL/TLS mode** in Cloudflare → **SSL/TLS → Overview** to **Full (strict)**. This ensures traffic between Cloudflare and your server is encrypted end-to-end.

---

### 4 — Set Up Resend for Auth Emails

Resend handles password reset, email verification, and other auth flow emails. The free tier (3,000 emails/month) is more than enough for a research project.

1. Sign up at [resend.com](https://resend.com)
2. Go to **Domains → Add Domain** and enter `timverse.ca`
3. Resend provides DNS records — add them all in Cloudflare:

| Type | Name | Value |
|---|---|---|
| TXT | `resend._domainkey` | *(provided by Resend)* |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com` |

4. Click **Verify** in Resend — takes a few minutes
5. Go to **API Keys → Create API Key** and copy it

Add these to your GitHub Secrets (see Step 8):

```
SMTP_HOST         = smtp.resend.com
SMTP_USER         = resend
SMTP_PASSWORD     = re_xxxxxxxxxxxx   ← your Resend API key
SMTP_PORT         = 587
SMTP_TLS          = true
EMAILS_FROM_EMAIL = noreply@timverse.ca
```

---

### Pre-Deployment Checklist

```
□ Cloudflare DNS A records added (@ www api docs traefik)
□ Cloudflare proxy enabled (orange cloud) for @ www api docs
□ Cloudflare SSL/TLS mode set to Full (strict)
□ Cloudflare API Token created with Zone:DNS:Edit for timverse.ca
□ VM launched on Béluga Cloud, floating IP noted and associated
□ Resend account created, domain verified
□ DNS records from Resend added in Cloudflare
□ All GitHub Secrets added (see Step 8)
```

---

## Architecture Overview

```
feat/fix commits pushed to main
      │
      ▼
Release Please Action
      │
      ├── docs/chore/ci commits → no release PR, nothing deploys
      │
      └── feat/fix commits → creates/updates Release PR
                                    │
                                    └── you merge the Release PR
                                              │
                                              ▼
                                    release-please pushes a v* tag
                                              │
                                              ▼
                                    Build and push triggers on release created
                                              │
                                              ├── [CI] Build backend image → push to GHCR
                                              ├── [CI] Build frontend image (VITE_API_URL baked in) → push to GHCR
                                              ├── SSH keep-alive configured
                                              ├── DB backup taken from running container
                                              ├── git checkout <tag> (detached HEAD — intentional)
                                              ├── .env written from GitHub Secrets
                                              ├── docker pull backend + frontend from GHCR
                                              ├── docker compose up -d db
                                              ├── docker compose run --rm prestart (migrations)
                                              └── docker compose up -d --no-deps backend frontend
                                                          │
                                                          ▼
                                              Cloudflare (proxy, DDoS protection, CDN)
                                                          │
                                                          ▼
                                              Traefik v2.11 (ports 80/443, Let's Encrypt DNS-01 via Cloudflare API)
                                                 ├── timverse.ca / www.timverse.ca  → frontend (nginx):80
                                                 ├── api.timverse.ca                → backend:8000
                                                 ├── docs.timverse.ca               → backend:8000
                                                 └── traefik.timverse.ca            → Traefik dashboard (DNS-only)
                                                                   │
                                                                   └── PostgreSQL → /mnt/data/postgres
```

> **Why build in CI and not on the server?** Building on the server over SSH is slow, has no layer caching, and risks timing out. Building in GitHub Actions with `--cache-from type=gha` means incremental builds take seconds. The server only runs `docker pull` at deploy time, which is fast and reliable.

> **Why is the server in detached HEAD state?** The server repo is not a development environment — it exists only to provide `docker-compose.yml` at the correct version. Detached HEAD is intentional and preferable: the server is pinned to exactly what was tagged, with no risk of accidental branch updates.

---

## Step 1 — Launch a VM on the Cloud Dashboard

1. Log in to your cloud dashboard:
   - **Béluga:** `beluga.cloud.computecanada.ca`
2. Go to **Compute → Instances → Launch Instance** with these exact settings:

| Tab | Field | Value |
|---|---|---|
| **Details** | Instance Name | `timverse-prod` |
| **Details** | Count | `1` |
| **Source** | Select Boot Source | `Image` |
| **Source** | Create New Volume | `Yes` |
| **Source** | Volume Size | `50 GB` |
| **Source** | Delete Volume on Instance Delete | `No` |
| **Source** | Image | `Ubuntu-22.04.6-Jammy-x64-2025-03` |
| **Flavor** | Flavor | `c2-7.5gb-92` |
| **Networks** | Network | your default project network |
| **Security Groups** | Security Groups | your existing default group |
| **Key Pair** | Key Pair | your SSH key |

---

## Step 2 — Configure Security Groups

In **Network → Security Groups → Manage Rules → Add Rule**, open the following ports:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | HTTP (Traefik) |
| 443  | TCP      | HTTPS (Traefik + Let's Encrypt) |

> Do **not** expose ports 8000, 5173, or 5432 — Traefik handles all routing internally.

---

## Step 3 — Allocate and Associate Floating IP

1. Go to **Network → Floating IPs → Allocate IP to Project**
   - Pool: `ext_net`
   - Description: `timverse-prod` (optional)
   - Click **Allocate IP**
2. In the Floating IPs list, click **Actions → Associate**
   - Port: select `timverse-prod`
   - Click **Associate**
3. Note the floating IP — you'll need it for DNS and GitHub Secrets

---

## Step 4 — Create and Attach Data Volume

1. Go to **Volumes → Create Volume**
   - Name: `timverse-postgres-data`
   - Size: `50 GB`
   - Leave all other fields as default
2. In the Volumes list, click **Actions → Attach Volume** → select `timverse-prod`

This keeps your PostgreSQL data on a separate volume that survives VM rebuilds.

---

## Step 5 — First-Time Server Setup (Manual, One-Time Only)

SSH into your VM and run:

```bash
ssh -i your-key.pem ubuntu@<floating-ip>

# Install Docker via official convenience script
# (do NOT use apt install docker.io — it installs an outdated version)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version

# Install git
sudo apt install git -y

# Mount the data volume (find device name first)
lsblk -f

# Usually /dev/vdb. Only format it if it has no existing filesystem.
# WARNING: mkfs destroys all data on the device.
sudo blkid /dev/vdb || sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Make mount persistent across reboots
DATA_UUID=$(sudo blkid -s UUID -o value /dev/vdb)
echo "UUID=$DATA_UUID /mnt/data ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
sudo mount -a

# Create dirs for postgres data and backups
sudo mkdir -p /mnt/data/postgres /mnt/data/backups
sudo chown -R ubuntu:ubuntu /mnt/data

# Create the shared Traefik network
docker network create traefik-public

# Generate a deploy SSH key for GitHub (no passphrase — required for CI/CD)
ssh-keygen -t ed25519 -C "timverse-prod-server" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# Copy this output → GitHub repo → Settings → Deploy keys → Add deploy key
# Title: timverse-prod-server, Allow write access: No

# Clone your repo using SSH (not HTTPS)
git clone git@github.com:your-org/your-repo.git ~/timverse-app
```

This server-side GitHub deploy key is only for `git fetch` / `git checkout` on the VM. The `SSH_PRIVATE_KEY` GitHub Actions secret added later is a different key: it is the private key that lets GitHub Actions SSH into the VM as `ubuntu`.

---

## Step 6 — Deploy Traefik (One-Time Only)

Create a directory for Traefik:

```bash
mkdir ~/traefik && cd ~/traefik
```

Create `docker-compose.yml` for Traefik with DNS-01 challenge support:

```yaml
services:
  traefik:
    image: traefik:v2.11
    restart: always
    ports:
      - "80:80"
      - "443:443"
    environment:
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN?Variable not set}
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-public-certificates:/certificates
    command:
      - --providers.docker
      - --providers.docker.exposedbydefault=false
      - --entrypoints.http.address=:80
      - --entrypoints.https.address=:443
      - --certificatesresolvers.le.acme.email=${EMAIL?Variable not set}
      - --certificatesresolvers.le.acme.storage=/certificates/acme.json
      - --certificatesresolvers.le.acme.dnschallenge=true
      - --certificatesresolvers.le.acme.dnschallenge.provider=cloudflare
      - --certificatesresolvers.le.acme.dnschallenge.resolvers=1.1.1.1:53,1.0.0.1:53
      - --accesslog
      - --log
      - --api
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik-public
      - traefik.http.services.traefik-dashboard.loadbalancer.server.port=8080
      - traefik.http.routers.traefik-dashboard-http.entrypoints=http
      - traefik.http.routers.traefik-dashboard-http.rule=Host(`traefik.${DOMAIN?Variable not set}`)
      - traefik.http.routers.traefik-dashboard-http.middlewares=https-redirect
      - traefik.http.routers.traefik-dashboard-https.entrypoints=https
      - traefik.http.routers.traefik-dashboard-https.rule=Host(`traefik.${DOMAIN?Variable not set}`)
      - traefik.http.routers.traefik-dashboard-https.tls=true
      - traefik.http.routers.traefik-dashboard-https.tls.certresolver=le
      - traefik.http.routers.traefik-dashboard-https.service=api@internal
      - traefik.http.middlewares.https-redirect.redirectscheme.scheme=https
      - traefik.http.middlewares.https-redirect.redirectscheme.permanent=true
      - traefik.http.middlewares.admin-auth.basicauth.users=${USERNAME?Variable not set}:${HASHED_PASSWORD?Variable not set}
      - traefik.http.routers.traefik-dashboard-https.middlewares=admin-auth
    networks:
      - traefik-public

volumes:
  traefik-public-certificates:

networks:
  traefik-public:
    external: true
```

> ⚠️ Use `traefik:v2.11` not v3 — Traefik v3 has a Docker API compatibility issue on Béluga Cloud VMs.

Create the Traefik `.env`:

```bash
# Generate a secure password
openssl rand -base64 32
# Copy the output, then generate the hash with it:
openssl passwd -apr1 'your-generated-password'

cat > .env <<EOF
EMAIL=you@email.com
USERNAME=admin
HASHED_PASSWORD=<paste-hashed-password-here>
CF_DNS_API_TOKEN=<your-cloudflare-api-token>
DOMAIN=timverse.ca
EOF
```

> ⚠️ Every `$` in `HASHED_PASSWORD` must be doubled (`$$`) in the `.env` file — otherwise Docker Compose interprets them as variable references. A hash like `$apr1$xyz$abc` becomes `$$apr1$$xyz$$abc`.

Start Traefik:

```bash
docker compose up -d
```

Verify it's running at `https://traefik.timverse.ca`.

> Traefik only needs to be deployed once. It will continue running independently of your app deploys. The DNS-01 challenge means Cloudflare proxy can be enabled on all public-facing subdomains — Traefik creates a temporary DNS TXT record to prove domain ownership without needing direct HTTP access.

---

## Step 7 — Configure docker-compose.yml

Your app's `docker-compose.yml` must use image references from environment variables — **no `build:` blocks**. Images are built in CI and pulled from GHCR at deploy time.

```yaml
services:
  db:
    image: postgres:18
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      retries: 5
      start_period: 30s
      timeout: 10s
    volumes:
      - app-db-data:/var/lib/postgresql/data/pgdata
    env_file:
      - .env
    environment:
      - PGDATA=/var/lib/postgresql/data/pgdata

  prestart:
    image: "${DOCKER_IMAGE_BACKEND}"
    # No build: block — image comes from GHCR
    networks:
      - default
    depends_on:
      db:
        condition: service_healthy
        restart: true
    command: bash scripts/prestart.sh
    env_file:
      - .env
    volumes:
      - ./backend/data:/app/data

  backend:
    image: "${DOCKER_IMAGE_BACKEND}"
    # No build: block — image comes from GHCR
    restart: always
    networks:
      - traefik-public
      - default
    depends_on:
      db:
        condition: service_healthy
      prestart:
        condition: service_completed_successfully
    env_file:
      - .env
    volumes:
      - ./backend/data:/app/data
    healthcheck:
      test:
        [
          "CMD",
          "python",
          "-c",
          "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/utils/health-check/')",
        ]
        
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik-public
      - traefik.constraint-label=traefik-public
      - traefik.http.services.${STACK_NAME?Variable not set}-backend.loadbalancer.server.port=8000
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-http.rule=Host(`api.${DOMAIN?Variable not set}`) || Host(`docs.${DOMAIN?Variable not set}`)
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-http.entrypoints=http
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-http.middlewares=https-redirect
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-https.rule=Host(`api.${DOMAIN?Variable not set}`) || Host(`docs.${DOMAIN?Variable not set}`)
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-https.entrypoints=https
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-https.tls=true
      - traefik.http.routers.${STACK_NAME?Variable not set}-backend-https.tls.certresolver=le

  frontend:
    image: "${DOCKER_IMAGE_FRONTEND}"
    # No build: block — image comes from GHCR
    # VITE_API_URL is a build-time arg baked into the image in CI, not here
    restart: always
    networks:
      - traefik-public
      - default
    depends_on:
      backend:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.docker.network=traefik-public
      - traefik.constraint-label=traefik-public
      - traefik.http.services.${STACK_NAME?Variable not set}-frontend.loadbalancer.server.port=80
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-http.rule=Host(`${DOMAIN?Variable not set}`) || Host(`www.${DOMAIN?Variable not set}`)
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-http.entrypoints=http
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-http.middlewares=https-redirect
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-https.rule=Host(`${DOMAIN?Variable not set}`) || Host(`www.${DOMAIN?Variable not set}`)
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-https.entrypoints=https
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-https.tls=true
      - traefik.http.routers.${STACK_NAME?Variable not set}-frontend-https.tls.certresolver=le

volumes:
  app-db-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres

networks:
  traefik-public:
    external: true
```

> ⚠️ **Never add `build:` blocks to the production compose file.** If anyone runs `docker compose up` without the env vars set, Docker would attempt to build locally instead of pulling from GHCR. Keep `build:` sections in a separate `docker-compose.override.yml` for local development only.

> ⚠️ **Do not add `:${TAG}` to image references.** The full image reference including the tag is already baked into `DOCKER_IMAGE_BACKEND` and `DOCKER_IMAGE_FRONTEND` by the deploy workflow. Adding `:${TAG}` produces a malformed reference like `image:v1.1.1:v1.1.1`.

---

## Step 8 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

> Use **environment secrets** scoped to a `production` environment for better access control (Settings → Environments → New environment → `production`).

Add each of the following secrets:

| Secret Name | Value |
|---|---|
| `DOMAIN` | `timverse.ca` |
| `FRONTEND_HOST` | `https://timverse.ca` |
| `SECRET_KEY` | *(run `openssl rand -hex 32`)* |
| `FIRST_SUPERUSER` | `admin@timverse.ca` |
| `FIRST_SUPERUSER_PASSWORD` | *(strong password)* |
| `BACKEND_CORS_ORIGINS` | `https://timverse.ca,https://www.timverse.ca` |
| `POSTGRES_DB` | *(your db name)* |
| `POSTGRES_USER` | *(your db user)* |
| `POSTGRES_PASSWORD` | *(run `openssl rand -hex 32`)* |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_USER` | `resend` |
| `SMTP_PASSWORD` | `re_xxxxxxxxxxxx` *(Resend API key)* |
| `SMTP_PORT` | `587` |
| `SMTP_TLS` | `true` |
| `EMAILS_FROM_EMAIL` | `noreply@timverse.ca` |
| `STACK_NAME` | `timverse` |
| `PROJECT_NAME` | `Timverse` |
| `SSH_HOST` | `<your-floating-ip>` |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | *(contents of the passphrase-free deploy key)* |
| `VITE_API_URL` | `https://api.timverse.ca` |
| `CF_DNS_API_TOKEN` | *(your Cloudflare API token)* |

> ⚠️ Never commit secrets or `.env` files to your repository. Add `.env` to `.gitignore`.
> ⚠️ The `SSH_PRIVATE_KEY` must be a **passphrase-free** key — GitHub Actions cannot interactively enter a passphrase.
> ⚠️ `VITE_API_URL` is a **build-time** argument baked into the frontend bundle by Vite during the CI build step. Changing it requires a new build and deploy — it cannot be updated at runtime.

---

## Step 9 — Set Up Conventional Commits and Automated Versioning

Deployments are triggered by releases, not every push. This means a `docs:` or `chore:` commit never deploys — only `feat:` and `fix:` commits accumulate into a release that you then merge to deploy.

### Commit message format

| Prefix | Effect |
|---|---|
| `feat: add search` | Release PR updated, minor version bump |
| `fix: login crash` | Release PR updated, patch version bump |
| `feat!: redesign API` | Release PR updated, major version bump |
| `docs: update readme` | No release, no deploy |
| `chore: bump deps` | No release, no deploy |
| `ci: fix workflow` | No release, no deploy |

### Files to add to your repo root

**`release-please-config.json`:**
```json
{
  "packages": {
    ".": {
      "release-type": "simple",
      "bump-minor-pre-major": true,
      "changelog-sections": [
        { "type": "feat", "section": "Features" },
        { "type": "fix", "section": "Bug Fixes" },
        { "type": "perf", "section": "Performance" },
        { "type": "revert", "section": "Reverts" }
      ]
    }
  }
}
```

**`.release-please-manifest.json`:**
```json
{
  ".": "0.1.0"
}
```

---

## Step 10 — GitHub Actions Workflows

### `.github/workflows/release.yml`

Runs on every push to `main`. Creates or updates a Release PR. release-please pushes a `v*` tag. When you merge the Release PR, the deploy step is triggered. The deploy step can be triggered manually via `workflow_dispatch` with an explicit tag input.

**Two jobs run in sequence:**
1. `build-and-push` — builds Docker images in CI with layer caching, pushes to GHCR
2. `deploy` — SSHes to the server, pulls the pre-built images, runs migrations, starts services

```yaml
name: Release and Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      tag:
        description: "Tag to deploy (e.g. v1.2.0)"
        required: true

permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          release-type: simple

  build-and-push:
    runs-on: ubuntu-latest
    needs: release
    if: ${{ needs.release.outputs.release_created == 'true' || github.event_name == 'workflow_dispatch' }}
    environment: production
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.inputs.tag || needs.release.outputs.tag_name }}

      - name: Lowercase repository name
        run: echo "REPO=${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/${{ env.REPO }}/backend:${{ github.event.inputs.tag || needs.release.outputs.tag_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/${{ env.REPO }}/frontend:${{ github.event.inputs.tag || needs.release.outputs.tag_name }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VITE_API_URL=${{ secrets.VITE_API_URL }}
            NODE_ENV=production

  deploy:
    runs-on: ubuntu-latest
    needs: [release, build-and-push]
    if: ${{ needs.release.outputs.release_created == 'true' || github.event_name == 'workflow_dispatch' }}
    environment: production
    permissions:
      contents: read
      packages: write
    steps:
      - name: Lowercase repository name
        run: echo "REPO=${GITHUB_REPOSITORY,,}" >> $GITHUB_ENV

      - name: Configure SSH keep-alive
        run: |
          mkdir -p ~/.ssh
          echo "ServerAliveInterval 60" >> ~/.ssh/config
          echo "ServerAliveCountMax 10" >> ~/.ssh/config

      - name: Set up SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add server to known hosts
        run: ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Backup database before deploy
        env:
          SSH_USER: ${{ secrets.SSH_USER }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          DEPLOY_TAG: ${{ github.event.inputs.tag || needs.release.outputs.tag_name }}
        run: |
          ssh $SSH_USER@$SSH_HOST "DEPLOY_TAG=$DEPLOY_TAG bash -s" <<EOF
            set -e

            cd ~/timverse-app

            if [ ! -f .env ]; then
              echo "No existing .env found; assuming first deploy and skipping pre-deploy backup."
              exit 0
            fi

            source .env

            # Silence Compose warnings about TAG not being set
            export TAG=\$DEPLOY_TAG

            TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

            DB_CONTAINER=\$(docker compose -f docker-compose.yml ps -q db)

            if [ -z "\$DB_CONTAINER" ]; then
              echo "Existing .env found but no running database container exists; cannot take a pre-deploy backup."
              exit 1
            fi

            docker compose exec -T db \
              pg_dump -U \$POSTGRES_USER \$POSTGRES_DB \
              | gzip > /mnt/data/backups/pre_deploy_\$TIMESTAMP.sql.gz

            echo "Pre-deploy backup saved: pre_deploy_\$TIMESTAMP.sql.gz"

            echo "Keep only last 5 backups"

            cd /mnt/data/backups

            ls -1t pre_deploy_*.sql.gz \
              | tail -n +6 \
              | xargs -r rm -f
          EOF

      - name: Deploy
        env:
          REPO: ${{ env.REPO }}
          SSH_USER: ${{ secrets.SSH_USER }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
          DEPLOY_TAG: ${{ github.event.inputs.tag || needs.release.outputs.tag_name }}
          DOMAIN: ${{ secrets.DOMAIN }}
          FRONTEND_HOST: ${{ secrets.FRONTEND_HOST }}
          STACK_NAME: ${{ secrets.STACK_NAME }}
          PROJECT_NAME: ${{ secrets.PROJECT_NAME }}
          SECRET_KEY: ${{ secrets.SECRET_KEY }}
          FIRST_SUPERUSER: ${{ secrets.FIRST_SUPERUSER }}
          FIRST_SUPERUSER_PASSWORD: ${{ secrets.FIRST_SUPERUSER_PASSWORD }}
          BACKEND_CORS_ORIGINS: ${{ secrets.BACKEND_CORS_ORIGINS }}
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          POSTGRES_DB: ${{ secrets.POSTGRES_DB }}
          POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
          POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
          SMTP_PORT: ${{ secrets.SMTP_PORT }}
          SMTP_TLS: ${{ secrets.SMTP_TLS }}
          EMAILS_FROM_EMAIL: ${{ secrets.EMAILS_FROM_EMAIL }}
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GH_ACTOR: ${{ github.actor }}
        run: |
          ssh $SSH_USER@$SSH_HOST "DEPLOY_TAG=$DEPLOY_TAG REPO=$REPO bash -s" <<EOF
            set -e
            cd ~/timverse-app

            echo "Deploying \$DEPLOY_TAG"

            PREVIOUS_COMMIT=\$(git rev-parse HEAD)
            echo \$PREVIOUS_COMMIT > .last_deploy
            if [ -f .env ]; then
              cp .env .env.rollback
            fi

            git fetch --tags
            git checkout \$DEPLOY_TAG

            cat > .env <<ENVFILE
          DOMAIN=${DOMAIN}
          FRONTEND_HOST=${FRONTEND_HOST}
          ENVIRONMENT=production
          STACK_NAME=${STACK_NAME}
          PROJECT_NAME=${PROJECT_NAME}
          SECRET_KEY=${SECRET_KEY}
          FIRST_SUPERUSER=${FIRST_SUPERUSER}
          FIRST_SUPERUSER_PASSWORD=${FIRST_SUPERUSER_PASSWORD}
          BACKEND_CORS_ORIGINS=${BACKEND_CORS_ORIGINS}
          VITE_API_URL=${VITE_API_URL}
          POSTGRES_SERVER=db
          POSTGRES_PORT=5432
          POSTGRES_DB=${POSTGRES_DB}
          POSTGRES_USER=${POSTGRES_USER}
          POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
          SMTP_HOST=${SMTP_HOST}
          SMTP_USER=${SMTP_USER}
          SMTP_PASSWORD=${SMTP_PASSWORD}
          SMTP_PORT=${SMTP_PORT}
          SMTP_TLS=${SMTP_TLS}
          EMAILS_FROM_EMAIL=${EMAILS_FROM_EMAIL}
          DOCKER_IMAGE_BACKEND=ghcr.io/\$REPO/backend:\$DEPLOY_TAG
          DOCKER_IMAGE_FRONTEND=ghcr.io/\$REPO/frontend:\$DEPLOY_TAG
          ENVFILE

            echo "${GH_TOKEN}" | docker login ghcr.io -u "${GH_ACTOR}" --password-stdin

            echo "Pulling backend and frontend docker images"

            docker compose -f docker-compose.yml pull backend frontend

            echo "Starting db container"

            docker compose -f docker-compose.yml up -d db

            echo "Running database migrations"

            docker compose -f docker-compose.yml run --rm prestart

            sleep 10
            echo "Validating deployment"

            BACKEND_CONTAINER=\$(docker compose -f docker-compose.yml ps -q backend)
            FRONTEND_CONTAINER=\$(docker compose -f docker-compose.yml ps -q frontend)

            if [ -z "\$BACKEND_CONTAINER" ] || [ -z "\$FRONTEND_CONTAINER" ]; then
              echo "Rolling back..."
              git checkout \$(cat .last_deploy)
              if [ -f .env.rollback ]; then
                mv .env.rollback .env
              fi
              docker compose -f docker-compose.yml up -d --no-deps --force-recreate backend frontend
              exit 1
            fi

            for i in \$(seq 1 30); do
              BACKEND_HEALTH=\$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "\$BACKEND_CONTAINER")
              FRONTEND_STATUS=\$(docker inspect --format='{{.State.Status}}' "\$FRONTEND_CONTAINER")

              if [ "\$BACKEND_HEALTH" = "healthy" ] && [ "\$FRONTEND_STATUS" = "running" ]; then
                break
              fi

              if [ "\$BACKEND_HEALTH" = "unhealthy" ] || [ "\$FRONTEND_STATUS" != "running" ]; then
                echo "Backend health: \$BACKEND_HEALTH"
                echo "Frontend status: \$FRONTEND_STATUS"
                docker compose -f docker-compose.yml logs --tail=100 backend frontend
                echo "Rolling back..."
                git checkout \$(cat .last_deploy)
                if [ -f .env.rollback ]; then
                  mv .env.rollback .env
                fi
                docker compose -f docker-compose.yml up -d --no-deps --force-recreate backend frontend
                exit 1
              fi

              sleep 2
            done

            BACKEND_HEALTH=\$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "\$BACKEND_CONTAINER")
            FRONTEND_STATUS=\$(docker inspect --format='{{.State.Status}}' "\$FRONTEND_CONTAINER")

            if [ "\$BACKEND_HEALTH" != "healthy" ] || [ "\$FRONTEND_STATUS" != "running" ]; then
              echo "Backend health: \$BACKEND_HEALTH"
              echo "Frontend status: \$FRONTEND_STATUS"
              docker compose -f docker-compose.yml logs --tail=100 backend frontend
              echo "Rolling back..."
              git checkout \$(cat .last_deploy)
              if [ -f .env.rollback ]; then
                mv .env.rollback .env
              fi
              docker compose -f docker-compose.yml up -d --no-deps --force-recreate backend frontend
              exit 1
            fi

            rm -f .env.rollback

            echo "Deploy complete: \$DEPLOY_TAG"

            echo "Cleaning unused Docker images..."
            docker image prune -a -f
          EOF

      - name: Clean up old backend images
        uses: actions/delete-package-versions@v5
        with:
          package-name: barkbyte/backend
          package-type: container
          min-versions-to-keep: 5
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Clean up old frontend images
        uses: actions/delete-package-versions@v5
        with:
          package-name: barkbyte/frontend
          package-type: container
          min-versions-to-keep: 5
          token: ${{ secrets.GITHUB_TOKEN }}

```

---

#### Key design decisions in the deploy workflow

| Decision | Reason |
|---|---|
| `DEPLOY_TAG` not `TAG` | `TAG` is a reserved variable in Docker Compose — using it causes the image reference to be doubled (e.g. `image:v1.1.1:v1.1.1`) |
| Unquoted `<<EOF` with `\$` escapes | Single-quoted `<<'EOF'` sends backslashes literally to the remote, breaking `$(...)` subshell syntax. Unquoted `<<EOF` lets the local shell strip the backslash so a bare `$` reaches the remote |
| `GH_TOKEN` / `GH_ACTOR` as env vars | Raw `${{ }}` expressions inside a heredoc are expanded before SSH sends it, bypassing Actions' secret masking. Env vars are masked properly |
| `--no-deps` on final `up` | Without it, Compose re-runs `prestart` when bringing up `backend` (due to `depends_on: prestart: condition: service_completed_successfully`), causing duplicate migration runs |
| Explicit `docker compose run --rm prestart` | Migrations run once before the app containers are recreated, so deploy behavior is predictable |
| Cleanup after deploy, not before | If the deploy fails and rolls back, you don't accidentally delete the image you just rolled back to |
| Lowercase repo name step | GHCR requires all image names to be lowercase; `github.repository` preserves original casing |

> The automatic rollback restores the previous app checkout and `.env`, then restarts backend/frontend containers. It does **not** undo database migrations or data changes. For a failed schema-changing release, restore from the pre-deploy backup after deciding that database rollback is required.

---

## Live URLs

| Service | URL |
|---|---|
| Frontend | `https://timverse.ca` |
| Frontend (www) | `https://www.timverse.ca` |
| Backend API | `https://api.timverse.ca` |
| API Docs | `https://docs.timverse.ca` |
| Traefik Dashboard | `https://traefik.timverse.ca` |

---

## Verifying a Deploy

After a GitHub Actions run completes, SSH into the server to verify:

```bash
cd ~/timverse-app

# Check all container statuses
docker compose -f docker-compose.yml ps

# Stream logs
docker compose -f docker-compose.yml logs -f

# Check a specific service
docker compose -f docker-compose.yml logs backend
docker compose -f docker-compose.yml logs frontend
```

Expected states:
- `db`, `backend`, `frontend` → `running`
- `prestart` does not stay listed after deploy — it runs once with `docker compose run --rm prestart` for DB migrations

---

## Accessing the Database in Production

```bash
ssh -i your-key.pem ubuntu@<floating-ip>
cd ~/timverse-app
set -o allexport
source .env
set +o allexport

# Open an interactive psql session
docker compose -f docker-compose.yml exec db psql -U "$POSTGRES_USER" "$POSTGRES_DB"

# Or run a one-off query
docker compose -f docker-compose.yml exec db psql -U "$POSTGRES_USER" "$POSTGRES_DB" -c "SELECT * FROM users LIMIT 10;"
```

---

## Database Backups

Backups run automatically via a cron job on the server and are stored on the persistent data volume at `/mnt/data/backups`. A pre-deploy backup is also triggered by GitHub Actions before every deploy after the first successful deployment.

### Setup (One-Time Only)

```bash
scp -i your-key.pem backup-db.sh ubuntu@<floating-ip>:~/backup-db.sh
ssh -i your-key.pem ubuntu@<floating-ip>
chmod +x ~/backup-db.sh
```

Schedule it with cron (runs daily at 2am):

```bash
crontab -e

# Add this line:
0 2 * * * /home/ubuntu/backup-db.sh >> /mnt/data/backups/backup.log 2>&1
```

### Off-Server Storage (Recommended)

```bash
sudo apt install awscli -y
aws configure --profile alliance
# Enter your Alliance object storage credentials when prompted

# Sync backups to your bucket
aws s3 sync /mnt/data/backups/ s3://your-bucket/db-backups/ --profile alliance
```

Add the `aws s3 sync` line to the end of `backup-db.sh` once configured.

### Restoring from a Backup

```bash
ssh -i your-key.pem ubuntu@<floating-ip>
cd ~/timverse-app
set -o allexport
source .env
set +o allexport

gunzip < /mnt/data/backups/backup_20240101_020000.sql.gz \
  | docker compose -f docker-compose.yml exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

### Backup Retention Strategy

| Location | Retention |
|---|---|
| Data volume (`/mnt/data/backups`) | 7 days (auto-deleted by script) |
| Object storage | 30 days (configure lifecycle rules in your bucket) |
| Pre-deploy snapshots | Last 5, auto-pruned by the deploy workflow |

### GHCR Image Retention

GHCR has no hard limit on versions, and container image storage is currently free. The deploy workflow automatically keeps only the last 5 versions of each image via `actions/delete-package-versions`. Note that pulls from outside GitHub Actions (i.e. your server pulling images at deploy time) count against your account's free data transfer quota (1 GB/month on the free plan).

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `traefik-public network not found` | Network not created | Run `docker network create traefik-public` on the server |
| Let's Encrypt DNS-01 challenge fails | Invalid or missing CF token | Check `CF_DNS_API_TOKEN` in Traefik `.env`, verify token has `Zone:DNS:Edit` |
| Certificate issued but browser shows error | Cloudflare SSL mode wrong | Set Cloudflare SSL/TLS → Overview to **Full (strict)** |
| Traefik Docker API version error | Traefik v3 incompatible on Béluga | Use `traefik:v2.11` — v3 has a Docker API issue on this platform |
| `HASHED_PASSWORD` variable warnings | `$` signs in hash not escaped | Double every `$` in `HASHED_PASSWORD` in `~/traefik/.env` |
| SSH passphrase prompt in Actions | The VM login key stored in `SSH_PRIVATE_KEY` has a passphrase | Use a passphrase-free CI/CD key for Actions, or configure a non-interactive secret handling strategy |
| Actions workflow not appearing | Wrong file path | Must be at exactly `.github/workflows/release.yml` |
| Actions triggers but doesn't deploy | No release was created | Deploy runs when Release Please creates a release after merging the Release PR, or when manually triggered with `workflow_dispatch` and a tag |
| SSH connection drops during build | Long build times out | Add `ServerAliveInterval 60` to SSH config step in workflow |
| `prestart` keeps restarting | DB not healthy yet | Check `docker compose logs db` |
| Frontend can't reach API | `VITE_API_URL` wrong | It's a **build-time** arg — ensure secret is `https://api.timverse.ca` and trigger a new deploy |
| DB data lost after reboot | `/mnt/data` not remounted | Check `/etc/fstab` entry and run `sudo mount -a` |
| 502 Bad Gateway | Backend not ready | Wait for health check, check `docker compose logs backend` |
| GitHub Actions SSH fails | Wrong key or host | Double-check `SSH_PRIVATE_KEY`, `SSH_HOST`, and `SSH_USER` secrets |
| Image name uppercase error | `github.repository` preserves casing | Ensure `Lowercase repository name` step is present in both jobs |
| Image reference format error (`image:v1.1.1:v1.1.1`) | `TAG` env var conflicts with Docker Compose | Use `DEPLOY_TAG` throughout — never use `TAG` as a variable name |
| `syntax error near unexpected token '('` | Heredoc uses `<<'EOF'` | Use unquoted `<<EOF` with `\$` to escape remote variables |
| Docker Compose `TAG` variable warning | `TAG` is set in the shell env | Use `DEPLOY_TAG` and export `TAG=\$DEPLOY_TAG` only where Compose needs it |
| `prestart` runs twice on deploy | Missing `--no-deps` | Add `--no-deps` to `docker compose up` for backend and frontend |

---

## Useful Commands

```bash
# Restart a single service
docker compose -f docker-compose.yml restart backend

# Rebuild and restart after manual changes
docker compose -f docker-compose.yml up -d --no-deps backend

# View real-time logs
docker compose -f docker-compose.yml logs -f

# Check all container statuses
docker compose -f docker-compose.yml ps

# Stop everything
docker compose -f docker-compose.yml down

# Stop and remove volumes (⚠️ deletes database)
docker compose -f docker-compose.yml down -v
```

---

## Security Best Practices

| Practice | Why |
|---|---|
| Never commit `.env` | Add it to `.gitignore` |
| Use a dedicated deploy SSH key | Don't use your personal key for CI/CD |
| Use GitHub Environments | Add approval gates before production deploys |
| Rotate `SECRET_KEY` carefully | Changing it invalidates all active user sessions |
| Restrict security group rules | Only open ports 22, 80, 443 |
| Keep `build:` out of production compose | Prevents accidental local builds if env vars are missing |

---

## Server Maintenance

### Automatic Security Updates (One-Time Setup)

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes" when prompted

sudo systemctl is-enabled unattended-upgrades
```

### Manual Update Workflow

```bash
# 1. Take a DB backup first
~/backup-db.sh

# 2. Apply updates
sudo apt update && sudo apt upgrade -y

# 3. Check if a reboot is required
cat /var/run/reboot-required

# 4. If reboot is needed
sudo reboot

# 5. After reboot, verify everything came back up
docker compose -f ~/timverse-app/docker-compose.yml ps
docker compose -f ~/traefik/docker-compose.yml ps
```

### Ensure Docker Starts on Boot

```bash
sudo systemctl enable docker
sudo systemctl is-enabled docker
# should output: enabled
```

### Update Summary

| Update Type | Approach | Notes |
|---|---|---|
| OS security patches | Automatic (`unattended-upgrades`) | Safe, non-breaking |
| Major OS upgrades | Manual, planned | Test in dev first |
| Docker / Compose | Manual, after DB backup | Verify containers after |
| Kernel updates | Manual reboot | Schedule during low-traffic |
| App deploys | Automatic via GitHub Actions | Pre-deploy backup runs first |

---

## References

- [Digital Alliance Canada — Cloud Docs](https://docs.alliancecan.ca/wiki/Cloud)
- [Arbutus Cloud](https://docs.alliancecan.ca/wiki/Arbutus_Cloud)
- [Traefik v2.11 Documentation](https://doc.traefik.io/traefik/v2.11/)
- [FastAPI Full Stack Template](https://github.com/fastapi/full-stack-fastapi-template)
- [GitHub Actions — Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Release Please Action](https://github.com/googleapis/release-please-action)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Alliance System Status](https://status.alliancecan.ca/)
