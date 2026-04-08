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

### 3 — Set Up Resend for Auth Emails

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
Git push to main
      │
      ▼
GitHub Actions
      │
      ├── SSH into VM
      ├── Write .env from GitHub Secrets
      ├── git pull latest code
      ├── docker compose build
      └── docker compose up -d
                  │
                  ▼
        Cloudflare (proxy, DDoS protection, CDN)
                  │
                  ▼
         Traefik (ports 80/443, Let's Encrypt DNS-01 TLS via Cloudflare API)
            ├── timverse.ca / www.timverse.ca  → frontend:80
            ├── api.timverse.ca                → backend:8000
            ├── docs.timverse.ca               → backend:8000
            └── traefik.timverse.ca            → Traefik dashboard (DNS-only)
                              │
                              └── PostgreSQL (internal only)
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

# Install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

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

# Clone your repo
git clone https://github.com/your-org/your-repo.git ~/timverse-app
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
    image: traefik:3.0
    ports:
      # Listen on port 80, default for HTTP, necessary to redirect to HTTPS
      - 80:80
      # Listen on port 443, default for HTTPS
      - 443:443
    restart: always
    environment:
      # Cloudflare API token for DNS-01 Let's Encrypt challenge.
      # Requires Zone:DNS:Edit permission for timverse.ca.
      # Allows Traefik to obtain certificates even behind Cloudflare proxy.
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN?Variable not set}
    labels:
      # Enable Traefik for this service, to make it available in the public network
      - traefik.enable=true
      # Use the traefik-public network (declared below)
      - traefik.docker.network=traefik-public
      # Define the port inside of the Docker service to use
      - traefik.http.services.traefik-dashboard.loadbalancer.server.port=8080

      # HTTP router for Traefik dashboard
      - traefik.http.routers.traefik-dashboard-http.entrypoints=http
      - traefik.http.routers.traefik-dashboard-http.rule=Host(`traefik.${DOMAIN?Variable not set}`)
      - traefik.http.routers.traefik-dashboard-http.middlewares=https-redirect

      # HTTPS router for Traefik dashboard
      - traefik.http.routers.traefik-dashboard-https.entrypoints=https
      - traefik.http.routers.traefik-dashboard-https.rule=Host(`traefik.${DOMAIN?Variable not set}`)
      - traefik.http.routers.traefik-dashboard-https.tls=true
      - traefik.http.routers.traefik-dashboard-https.tls.certresolver=le
      - traefik.http.routers.traefik-dashboard-https.service=api@internal

      # https-redirect middleware — redirect all HTTP to HTTPS permanently
      - traefik.http.middlewares.https-redirect.redirectscheme.scheme=https
      - traefik.http.middlewares.https-redirect.redirectscheme.permanent=true
      - traefik.http.routers.traefik-dashboard-http.middlewares=https-redirect

      # Basic auth middleware for Traefik dashboard
      - traefik.http.middlewares.admin-auth.basicauth.users=${USERNAME?Variable not set}:${HASHED_PASSWORD?Variable not set}
      - traefik.http.routers.traefik-dashboard-https.middlewares=admin-auth

    volumes:
      # Mount Docker socket so Traefik can read labels from other services
      - /var/run/docker.sock:/var/run/docker.sock:ro
      # Mount volume to persist Let's Encrypt certificates
      - traefik-public-certificates:/certificates

    command:
      # Enable Docker provider
      - --providers.docker
      # Do not expose all Docker services — only those with traefik.enable=true
      - --providers.docker.exposedbydefault=false
      # HTTP entrypoint on port 80
      - --entrypoints.http.address=:80
      # HTTPS entrypoint on port 443
      - --entrypoints.https.address=:443

      # Let's Encrypt certificate resolver using DNS-01 challenge via Cloudflare.
      # DNS-01 is required because our public subdomains are behind Cloudflare proxy
      # (HTTP-01 challenge cannot reach the server directly when proxied).
      - --certificatesresolvers.le.acme.email=${EMAIL?Variable not set}
      - --certificatesresolvers.le.acme.storage=/certificates/acme.json
      - --certificatesresolvers.le.acme.dnschallenge=true
      - --certificatesresolvers.le.acme.dnschallenge.provider=cloudflare
      # Use Cloudflare's public resolvers to verify the DNS challenge record
      - --certificatesresolvers.le.acme.dnschallenge.resolvers=1.1.1.1:53,1.0.0.1:53

      # Enable access log and Traefik log
      - --accesslog
      - --log
      # Enable the Traefik Dashboard and API
      - --api

    networks:
      - traefik-public

volumes:
  traefik-public-certificates:

networks:
  traefik-public:
    external: true

```

Create the Traefik `.env`:

```bash
HASHED_PASSWORD=$(openssl passwd -apr1 yourpassword)

cat > .env <<EOF
EMAIL=you@email.com
USERNAME=admin
HASHED_PASSWORD=<paste-hashed-password-here>
CF_DNS_API_TOKEN=<your-cloudflare-api-token>
EOF
```

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

Add each of the following secrets:

| Secret Name | Value |
|---|---|
| `DOMAIN` | `timverse.ca` |
| `FRONTEND_HOST` | `https://timverse.ca` |
| `SECRET_KEY` | *(run `openssl rand -hex 32`)* |
| `FIRST_SUPERUSER` | `admin@timverse.ca` |
| `FIRST_SUPERUSER_PASSWORD` | *(run `openssl rand -base64 32`)* |
| `BACKEND_CORS_ORIGINS` | `https://timverse.ca,https://api.timverse.ca` |
| `POSTGRES_DB` | `timeversedb` |
| `POSTGRES_USER` | `timverse` |
| `POSTGRES_PASSWORD` | *(run `openssl rand -base64 32`)* |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_USER` | `resend` |
| `SMTP_PASSWORD` | `re_xxxxxxxxxxxx` *(Resend API key)* |
| `SMTP_PORT` | `587` |
| `SMTP_TLS` | `true` |
| `EMAILS_FROM_EMAIL` | `noreply@timverse.ca` |
| `STACK_NAME` | `timverse` |
| `SSH_HOST` | `<your-floating-ip>` |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | *(contents of your `.pem` key)* |
| `VITE_API_URL` | `https://api.timverse.ca` |
| `CF_DNS_API_TOKEN` | *(your Cloudflare API token)* |

> ⚠️ Never commit secrets or `.env` files to your repository. Add `.env` to `.gitignore`.

---

## Step 9 — Create the GitHub Actions Workflow

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

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
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd ~/timverse-app

            # Pull latest code
            git pull origin main

            # Write .env from GitHub Secrets
            cat > .env <<ENVFILE
          DOMAIN=${{ secrets.DOMAIN }}
          FRONTEND_HOST=${{ secrets.FRONTEND_HOST }}
          ENVIRONMENT=production
          STACK_NAME=${{ secrets.STACK_NAME }}
          SECRET_KEY=${{ secrets.SECRET_KEY }}
          FIRST_SUPERUSER=${{ secrets.FIRST_SUPERUSER }}
          FIRST_SUPERUSER_PASSWORD=${{ secrets.FIRST_SUPERUSER_PASSWORD }}
          BACKEND_CORS_ORIGINS=${{ secrets.BACKEND_CORS_ORIGINS }}
          VITE_API_URL=${{ secrets.VITE_API_URL }}
          POSTGRES_SERVER=db
          POSTGRES_PORT=5432
          POSTGRES_DB=${{ secrets.POSTGRES_DB }}
          POSTGRES_USER=${{ secrets.POSTGRES_USER }}
          POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}
          SMTP_HOST=${{ secrets.SMTP_HOST }}
          SMTP_USER=${{ secrets.SMTP_USER }}
          SMTP_PASSWORD=${{ secrets.SMTP_PASSWORD }}
          EMAILS_FROM_EMAIL=${{ secrets.EMAILS_FROM_EMAIL }}
          DOCKER_IMAGE_BACKEND=timverse-backend
          DOCKER_IMAGE_FRONTEND=timverse-frontend
          TAG=latest
          ENVFILE

            # Build and restart
            docker compose -f docker-compose.yml build
            docker compose -f docker-compose.yml up -d

          EOF
```

Commit and push this file to `main`. Every subsequent push to `main` will trigger an automatic deploy.

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
# Check all container statuses
docker compose ps

# Stream logs
docker compose logs -f

# Check a specific service
docker compose logs backend
docker compose logs frontend
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
| `prestart` keeps restarting | DB not healthy yet | Check `docker compose logs db` |
| Frontend can't reach API | `VITE_API_URL` wrong | It's a **build-time** arg — ensure secret is `https://api.timverse.ca` and rebuild |
| DB data lost after reboot | `/mnt/data` not remounted | Check `/etc/fstab` entry and run `sudo mount -a` |
| 502 Bad Gateway | Backend not ready | Wait for health check, check `docker compose logs backend` |
| GitHub Actions SSH fails | Wrong key or host | Double-check `SSH_PRIVATE_KEY`, `SSH_HOST`, and `SSH_USER` secrets |

---

## Useful Commands

```bash
# Restart a single service
docker compose restart backend

# Rebuild and restart after manual changes
docker compose build backend && docker compose up -d backend

# View real-time logs
docker compose logs -f

# Stop everything
docker compose down

# Stop and remove volumes (⚠️ deletes database)
docker compose down -v
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
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [FastAPI Full Stack Template](https://github.com/fastapi/full-stack-fastapi-template)
- [GitHub Actions — Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Alliance System Status](https://status.alliancecan.ca/)
