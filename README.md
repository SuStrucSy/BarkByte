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

### 1 — Register a Domain

Register a `.ca` or `.org` domain at [Namecheap](https://namecheap.com):
- **Cost:** ~$15–20 CAD/year
- Search for `yourprojectname.ca` or `yourprojectname.org`
- Complete purchase and log in to your Namecheap dashboard

---

### 2 — Move DNS to Cloudflare

Cloudflare gives you free DDoS protection, fast DNS propagation, and easy record management.

1. Sign up at [cloudflare.com](https://cloudflare.com) (free)
2. Click **Add a Site** and enter your domain
3. Select the **Free plan**
4. Cloudflare scans your existing DNS and gives you two nameservers, e.g.:
   ```
   aria.ns.cloudflare.com
   bob.ns.cloudflare.com
   ```
5. In Namecheap → **Domain List → Manage → Nameservers**, select **Custom DNS** and paste Cloudflare's nameservers
6. Back in Cloudflare, click **Done** — propagation takes a few minutes to a few hours

> All DNS management happens in Cloudflare from this point forward.

---

### 3 — Add DNS A Records in Cloudflare

Once your Béluga Cloud VM is running and you have a floating IP, add these records in Cloudflare → **DNS → Records**:

| Name | Type | Value | Proxy Status |
|---|---|---|---|
| `dashboard` | A | `<your-floating-ip>` | DNS only (grey cloud) |
| `traefik` | A | `<your-floating-ip>` | DNS only (grey cloud) |

> ⚠️ Set to **DNS only** (not proxied). Traefik handles TLS directly via Let's Encrypt and is incompatible with Cloudflare's proxy for certificate challenges.

---

### 4 — Set Up Resend for Auth Emails

Resend handles password reset, email verification, and other auth flow emails. The free tier (3,000 emails/month) is more than enough for a research project.

1. Sign up at [resend.com](https://resend.com)
2. Go to **Domains → Add Domain** and enter your domain
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
SMTP_HOST        = smtp.resend.com
SMTP_USER        = resend
SMTP_PASSWORD    = re_xxxxxxxxxxxx   ← your Resend API key
SMTP_PORT        = 587
SMTP_TLS         = true
EMAILS_FROM_EMAIL = noreply@yourdomain.ca
```

---

### Pre-Deployment Checklist

```
□ Domain registered on Namecheap
□ DNS transferred to Cloudflare
□ VM launched on Béluga Cloud, floating IP noted
□ A records added in Cloudflare (dashboard, traefik)
□ Resend account created, domain verified
□ DNS records from Resend added in Cloudflare
□ All GitHub Secrets added (see Step 6)
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
         Traefik (ports 80/443, Let's Encrypt TLS)
         dashboard.yourdomain.ca
            ├── /api/*   → backend:8000  (priority 10, internal only)
            ├── /docs    → backend:8000  (priority 10, internal only)
            └── /*       → frontend:80  (priority 1, catch-all)
                              │
                              └── PostgreSQL (internal only)
```

---

## Step 1 — Launch a VM on the Cloud Dashboard

1. Log in to your cloud dashboard:
   - **Béluga:** `beluga.cloud.computecanada.ca`
   - **Arbutus:** `arbutus.cloud.computecanada.ca`
2. Go to **Compute → Instances → Launch Instance**
3. Select:
   - **Image:** Ubuntu 22.04
   - **Flavor:** `c2-7.5gb-92` or larger depending on your allocation
   - **Key Pair:** your SSH key
4. Go to **Network → Floating IPs → Allocate IP** and associate it with your instance

---

## Step 2 — Configure Security Groups

In **Network → Security Groups**, open the following ports:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | HTTP (Traefik) |
| 443  | TCP      | HTTPS (Traefik + Let's Encrypt) |

> Do **not** expose ports 8000, 5173, or 5432 — Traefik handles all routing internally.

---

## Step 3 — Point Your Domain DNS

Add the following **A records** at your domain registrar, all pointing to your floating IP:

```
dashboard.yourdomain.ca  → <floating-ip>
traefik.yourdomain.ca    → <floating-ip>
```

> The backend no longer needs a DNS record — it is not publicly routed. All API traffic goes through `dashboard.yourdomain.ca/api/` and is proxied internally by Nginx.

---

## Step 4 — First-Time Server Setup (Manual, One-Time Only)

SSH into your VM and run:

```bash
ssh -i your-key.pem ubuntu@<floating-ip>

# Install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose-plugin git -y
sudo usermod -aG docker $USER
newgrp docker

# Create the shared Traefik network
docker network create traefik-public

# Clone your repo
git clone https://github.com/your-org/your-repo.git ~/your-app-repo
```

---

## Step 5 — Deploy Traefik (One-Time Only)

Create a directory for Traefik and add the Traefik `docker-compose.yml`:

```bash
mkdir ~/traefik && cd ~/traefik
# Add your traefik docker-compose.yml here
```

Create the Traefik `.env`:

```bash
HASHED_PASSWORD=$(openssl passwd -apr1 yourpassword)

cat > .env <<EOF
DOMAIN=yourdomain.ca
EMAIL=you@email.com
USERNAME=admin
HASHED_PASSWORD=<paste-hashed-password-here>
EOF
```

Start Traefik:

```bash
docker compose up -d
```

Verify it's running at `https://traefik.yourdomain.ca`.

> Traefik only needs to be deployed once. It will continue running independently of your app deploys.

---

## Step 6 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

Add each of the following secrets:

| Secret Name | Example Value |
|---|---|
| `DOMAIN` | `yourdomain.ca` |
| `FRONTEND_HOST` | `https://dashboard.yourdomain.ca` |
| `SECRET_KEY` | *(run `openssl rand -hex 32`)* |
| `FIRST_SUPERUSER` | `admin@yourdomain.ca` |
| `FIRST_SUPERUSER_PASSWORD` | `changethis` |
| `BACKEND_CORS_ORIGINS` | `https://dashboard.yourdomain.ca` |
| `POSTGRES_DB` | `app` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `changethis` |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_USER` | `resend` |
| `SMTP_PASSWORD` | `re_xxxxxxxxxxxx` *(Resend API key)* |
| `SMTP_PORT` | `587` |
| `SMTP_TLS` | `true` |
| `EMAILS_FROM_EMAIL` | `noreply@yourdomain.ca` |
| `STACK_NAME` | `myapp` |
| `SSH_HOST` | `<your-floating-ip>` |
| `SSH_USER` | `ubuntu` |
| `SSH_PRIVATE_KEY` | *(contents of your `.pem` key)* |

> ⚠️ Never commit secrets or `.env` files to your repository. Add `.env` to `.gitignore`.

---

## Step 7 — Create the GitHub Actions Workflow

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

      - name: Write .env and deploy
        run: |
          ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
            cd ~/your-app-repo

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
          POSTGRES_SERVER=db
          POSTGRES_PORT=5432
          POSTGRES_DB=${{ secrets.POSTGRES_DB }}
          POSTGRES_USER=${{ secrets.POSTGRES_USER }}
          POSTGRES_PASSWORD=${{ secrets.POSTGRES_PASSWORD }}
          SMTP_HOST=${{ secrets.SMTP_HOST }}
          SMTP_USER=${{ secrets.SMTP_USER }}
          SMTP_PASSWORD=${{ secrets.SMTP_PASSWORD }}
          EMAILS_FROM_EMAIL=${{ secrets.EMAILS_FROM_EMAIL }}
          DOCKER_IMAGE_BACKEND=myapp-backend
          DOCKER_IMAGE_FRONTEND=myapp-frontend
          TAG=latest
          ENVFILE

            # Build and restart
            docker compose build
            docker compose up -d

          EOF
```

Commit and push this file to `main`. Every subsequent push to `main` will trigger an automatic deploy.

---

## Live URLs

| Service           | URL                                        |
|-------------------|--------------------------------------------|
| Frontend          | `https://dashboard.yourdomain.ca`         |
| Backend API       | `https://dashboard.yourdomain.ca/api/`    |
| API Docs          | `https://dashboard.yourdomain.ca/docs`    |
| Traefik Dashboard | `https://traefik.yourdomain.ca`           |

> The backend has no public subdomain. Traefik routes `/api/`, `/docs`, and `/redoc` to the backend internally by path, and everything else to the frontend. To disable public API docs, remove the `PathPrefix('/docs') || PathPrefix('/redoc')` rules from the backend Traefik labels in `docker-compose.yml`.

### Accessing the Database in Production

If you need to inspect or query the production database directly, SSH in and use `psql`:

```bash
ssh -i your-key.pem ubuntu@<floating-ip>

# Open an interactive psql session
docker exec -it your-app-db-1 psql -U $POSTGRES_USER $POSTGRES_DB

# Or run a one-off query
docker exec your-app-db-1 psql -U $POSTGRES_USER $POSTGRES_DB -c "SELECT * FROM users LIMIT 10;"
```

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

## Database Backups

Backups run automatically via a cron job on the server. A pre-deploy backup is also triggered by GitHub Actions before every deploy.

### Setup (One-Time Only)

Copy the backup script to your server and make it executable:

```bash
scp -i your-key.pem scripts/backup-db.sh ubuntu@<floating-ip>:~/backup-db.sh
ssh -i your-key.pem ubuntu@<floating-ip>
chmod +x ~/backup-db.sh
mkdir -p ~/backups
```

Schedule it with cron (runs daily at 2am):

```bash
crontab -e

# Add this line:
0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backups/backup.log 2>&1
```

### Off-Server Storage (Recommended)

Backups stored only on the VM are lost if the VM is deleted. Push them to Alliance object storage:

```bash
# Install AWS CLI (compatible with Alliance S3 object storage)
sudo apt install awscli -y
aws configure --profile alliance
# Enter your Alliance object storage credentials when prompted

# Sync backups to your bucket
aws s3 sync ~/backups/ s3://your-bucket/db-backups/ --profile alliance
```

Add the `aws s3 sync` line to the end of `backup-db.sh` once configured.

### Add Pre-Deploy Backup to GitHub Actions

Add this step to `.github/workflows/deploy.yml` **before** the deploy step:

```yaml
- name: Backup database before deploy
  run: |
    ssh ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'EOF'
      TIMESTAMP=$(date +%Y%m%d_%H%M%S)
      CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)
      docker exec $CONTAINER pg_dump -U $POSTGRES_USER $POSTGRES_DB \
        | gzip > ~/backups/pre_deploy_$TIMESTAMP.sql.gz
      echo "Pre-deploy backup saved: pre_deploy_$TIMESTAMP.sql.gz"
    EOF
```

### Restoring from a Backup

```bash
# SSH into server
ssh -i your-key.pem ubuntu@<floating-ip>

# Restore a specific backup
gunzip < ~/backups/backup_20240101_020000.sql.gz \
  | docker exec -i your-app-db-1 psql -U $POSTGRES_USER $POSTGRES_DB
```

### Backup Retention Strategy

| Location | Retention |
|---|---|
| Local (`~/backups`) | 7 days (auto-deleted by script) |
| Object storage | 30 days (configure lifecycle rules in your bucket) |
| Pre-deploy snapshots | Keep last 5 manually |

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `traefik-public network not found` | Network not created | Run `docker network create traefik-public` on the server |
| Let's Encrypt certificate fails | DNS not propagated | Wait for DNS, then restart Traefik |
| `prestart` keeps restarting | DB not healthy yet | Check `docker compose logs db` |
| Frontend can't reach backend | `VITE_API_URL` wrong | It's a **build-time** arg — ensure `DOMAIN` secret is correct and rebuild |
| DB data lost after reboot | Volume misconfigured | Verify `app-db-data` volume with `docker volume ls` |
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

Enable unattended security patches so critical OS fixes apply automatically without manual intervention. This only applies security-only updates — major version upgrades are left for you to control manually.

```bash
# Install and enable unattended-upgrades
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Select "Yes" when prompted

# Verify it's active
sudo systemctl is-enabled unattended-upgrades
```

---

### Manual Update Workflow

When performing manual updates (Docker, kernel, or major OS packages), always follow this order to avoid data loss:

```bash
# 1. Take a DB backup first
~/backup-db.sh

# 2. Apply updates
sudo apt update && sudo apt upgrade -y

# 3. Check if a reboot is required (kernel updates etc.)
cat /var/run/reboot-required
# If file exists, outputs: *** System restart required ***

# 4. If reboot is needed — do it during low-traffic period
sudo reboot

# 5. After reboot, verify everything came back up
docker compose -f ~/your-app-repo/docker-compose.yml ps
docker compose -f ~/traefik/docker-compose.yml ps
```

---

### Updating Docker and Docker Compose

Docker updates should be done manually and deliberately — always verify containers are healthy afterwards:

```bash
# Check current versions
docker --version
docker compose version

# Update
sudo apt update
sudo apt upgrade docker.io docker-compose-plugin -y

# Verify all containers are still running
cd ~/your-app-repo && docker compose ps
```

---

### Ensure Docker Starts on Boot

If not already done during initial setup, enable Docker to start automatically when the VM reboots:

```bash
sudo systemctl enable docker

# Verify
sudo systemctl is-enabled docker
# should output: enabled
```

Because all production services have `restart: always` in `docker-compose.yml`, they will automatically come back up after any reboot or crash once Docker itself is running.

---

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
