# Deploying Full-Stack App to Béluga / Arbutus Cloud (Digital Alliance Canada)

This guide covers deploying a FastAPI + React (Vite) + PostgreSQL stack with Traefik as a reverse proxy on the Digital Alliance Canada OpenStack cloud (Béluga or Arbutus), using **GitHub Actions** for automated CI/CD. Secrets are managed via GitHub and never stored in the repository.

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

Add these to your GitHub Secrets (see Step 6):

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
                                    Deploy workflow triggers
                                              │
                                              ├── SSH keep-alive configured
                                              ├── DB backup taken
                                              ├── .env written from GitHub Secrets
                                              ├── git pull latest code
                                              ├── docker compose -f docker-compose.yml build
                                              └── docker compose -f docker-compose.yml up -d
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
lsblk
# Usually /dev/vdb — format and mount it
sudo mkfs.ext4 /dev/vdb
sudo mkdir -p /mnt/data
sudo mount /dev/vdb /mnt/data

# Make mount persistent across reboots
echo '/dev/vdb /mnt/data ext4 defaults 0 2' | sudo tee -a /etc/fstab

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

## Step 7 — Configure Traefik Labels in docker-compose.yml

Update your app's `docker-compose.yml` Traefik labels to use subdomain routing:

**Frontend service:**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.frontend.rule=Host(`timverse.ca`) || Host(`www.timverse.ca`)"
  - "traefik.http.routers.frontend.entrypoints=websecure"
  - "traefik.http.routers.frontend.tls.certresolver=le"
  - "traefik.http.services.frontend.loadbalancer.server.port=80"
```

**Backend service:**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.backend.rule=Host(`api.timverse.ca`) || Host(`docs.timverse.ca`)"
  - "traefik.http.routers.backend.entrypoints=websecure"
  - "traefik.http.routers.backend.tls.certresolver=le"
  - "traefik.http.services.backend.loadbalancer.server.port=8000"
```

Also update your PostgreSQL volume path to use the mounted data volume:
```yaml
volumes:
  app-db-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres
```

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
| `BACKEND_CORS_ORIGINS` | `https://timverse.ca,https://api.timverse.ca` |
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

### `.github/workflows/release.yml`

```yaml
name: Release Please

on:
  push:
    branches:
      - main

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
```

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Server

on:
  release:
    types: [published]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

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
        run: |
          ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Backup database before deploy
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)
            if [ -n "$CONTAINER" ]; then
              docker exec $CONTAINER pg_dump -U $POSTGRES_USER $POSTGRES_DB \
                | gzip > /mnt/data/backups/pre_deploy_$TIMESTAMP.sql.gz
              echo "Pre-deploy backup saved: pre_deploy_$TIMESTAMP.sql.gz"
            else
              echo "No DB container running — skipping backup (first deploy?)"
            fi
          EOF

      - name: Write .env and deploy
        env:
          SSH_USER: ${{ secrets.SSH_USER }}
          SSH_HOST: ${{ secrets.SSH_HOST }}
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
          EMAILS_FROM_EMAIL: ${{ secrets.EMAILS_FROM_EMAIL }}
        run: |
          ssh $SSH_USER@$SSH_HOST 'bash -s' <<EOF
          cd ~/timverse-app
          git pull origin main

          cat > .env <<ENVFILE
          DOMAIN='${DOMAIN}'
          FRONTEND_HOST='${FRONTEND_HOST}'
          ENVIRONMENT='production'
          STACK_NAME='${STACK_NAME}'
          PROJECT_NAME='${PROJECT_NAME}'
          SECRET_KEY='${SECRET_KEY}'
          FIRST_SUPERUSER='${FIRST_SUPERUSER}'
          FIRST_SUPERUSER_PASSWORD='${FIRST_SUPERUSER_PASSWORD}'
          BACKEND_CORS_ORIGINS='${BACKEND_CORS_ORIGINS}'
          VITE_API_URL='${VITE_API_URL}'
          POSTGRES_SERVER='db'
          POSTGRES_PORT='5432'
          POSTGRES_DB='${POSTGRES_DB}'
          POSTGRES_USER='${POSTGRES_USER}'
          POSTGRES_PASSWORD='${POSTGRES_PASSWORD}'
          SMTP_HOST='${SMTP_HOST}'
          SMTP_USER='${SMTP_USER}'
          SMTP_PASSWORD='${SMTP_PASSWORD}'
          EMAILS_FROM_EMAIL='${EMAILS_FROM_EMAIL}'
          DOCKER_IMAGE_BACKEND='timverse-backend'
          DOCKER_IMAGE_FRONTEND='timverse-frontend'
          TAG='latest'
          ENVFILE

          docker compose -f docker-compose.yml build
          docker compose -f docker-compose.yml up -d
          EOF
```

> `workflow_dispatch` allows manually triggering a deploy from GitHub → Actions → Deploy to Server → Run workflow, without needing a new release.



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
- `db`, `backend`, `frontend`, `adminer` → `running`
- `prestart` → `exited (0)` — this is normal, it runs once for DB migrations

---

## Accessing the Database in Production

```bash
ssh -i your-key.pem ubuntu@<floating-ip>

# Open an interactive psql session
docker exec -it timverse-db-1 psql -U $POSTGRES_USER $POSTGRES_DB

# Or run a one-off query
docker exec timverse-db-1 psql -U $POSTGRES_USER $POSTGRES_DB -c "SELECT * FROM users LIMIT 10;"
```

---

## Database Backups

Backups run automatically via a cron job on the server and are stored on the persistent data volume at `/mnt/data/backups`. A pre-deploy backup is also triggered by GitHub Actions before every deploy.

### Setup (One-Time Only)

```bash
scp -i your-key.pem scripts/backup-db.sh ubuntu@<floating-ip>:~/backup-db.sh
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

gunzip < /mnt/data/backups/backup_20240101_020000.sql.gz \
  | docker exec -i timverse-db-1 psql -U $POSTGRES_USER $POSTGRES_DB
```

### Backup Retention Strategy

| Location | Retention |
|---|---|
| Data volume (`/mnt/data/backups`) | 7 days (auto-deleted by script) |
| Object storage | 30 days (configure lifecycle rules in your bucket) |
| Pre-deploy snapshots | Keep last 5 manually |

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `traefik-public network not found` | Network not created | Run `docker network create traefik-public` on the server |
| Let's Encrypt DNS-01 challenge fails | Invalid or missing CF token | Check `CF_DNS_API_TOKEN` in Traefik `.env`, verify token has `Zone:DNS:Edit` |
| Certificate issued but browser shows error | Cloudflare SSL mode wrong | Set Cloudflare SSL/TLS → Overview to **Full (strict)** |
| Traefik Docker API version error | Traefik v3 incompatible on Béluga | Use `traefik:v2.11` — v3 has a Docker API issue on this platform |
| `HASHED_PASSWORD` variable warnings | `$` signs in hash not escaped | Double every `$` in `HASHED_PASSWORD` in `~/traefik/.env` |
| SSH passphrase prompt in Actions | Deploy key has a passphrase | Generate a new key with `-N ""` (no passphrase) |
| Actions workflow not appearing | Wrong file path | Must be at exactly `.github/workflows/deploy.yml` |
| Actions triggers but doesn't deploy | Using push trigger | Deploy only triggers on published release — merge the Release PR first |
| SSH connection drops during build | Long build times out | Add `ServerAliveInterval 60` to SSH config step in workflow |
| `prestart` keeps restarting | DB not healthy yet | Check `docker compose logs db` |
| Frontend can't reach API | `VITE_API_URL` wrong | It's a **build-time** arg — ensure secret is `https://api.timverse.ca` and rebuild |
| DB data lost after reboot | `/mnt/data` not remounted | Check `/etc/fstab` entry and run `sudo mount -a` |
| 502 Bad Gateway | Backend not ready | Wait for health check, check `docker compose logs backend` |
| GitHub Actions SSH fails | Wrong key or host | Double-check `SSH_PRIVATE_KEY`, `SSH_HOST`, and `SSH_USER` secrets |

---

## Useful Commands

```bash
# Restart a single service
docker compose -f docker-compose.yml restart backend

# Rebuild and restart after manual changes
docker compose -f docker-compose.yml build backend && docker compose -f docker-compose.yml up -d backend

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
- [Alliance System Status](https://status.alliancecan.ca/)
