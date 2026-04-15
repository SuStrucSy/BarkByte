#!/bin/bash
# =============================================================================
# backup-db.sh — PostgreSQL backup script for Docker-based deployments
#
# Usage:
#   ./backup-db.sh
#
# Schedule with cron (daily at 2am):
#   0 2 * * * /home/ubuntu/backup-db.sh >> /home/ubuntu/backups/backup.log 2>&1
#
# Place this file on your server at ~/backup-db.sh
# Run: chmod +x ~/backup-db.sh
# =============================================================================
set -euo pipefail

BACKUP_DIR=~/backups
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

APP_DIR=~/timverse-app

# ✅ safer env loading
if [ -f "$APP_DIR/.env" ]; then
  set -o allexport
  source "$APP_DIR/.env"
  set +o allexport
fi

# ✅ better container detection
CONTAINER=$(docker compose -f "$APP_DIR/docker-compose.yml" ps -q db)

if [ -z "$CONTAINER" ]; then
  echo "[ERROR] $(date): No running database container found."
  exit 1
fi

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
  echo "[ERROR] $(date): POSTGRES_USER or POSTGRES_DB not set."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "[INFO] $(date): Starting backup of '$POSTGRES_DB'..."

echo "[INFO] Using container: '$CONTAINER'"
echo "[INFO] Backup file: '$BACKUP_FILE'"


# ✅ safer exec + failure handling
docker exec "$CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[INFO] $(date): Backup complete — $BACKUP_FILE ($BACKUP_SIZE)"

echo "[INFO] $(date): Cleaning old backups..."
find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -print -delete


# --- Optional: sync to Alliance S3 object storage ---------------------------
# Uncomment and configure after running: aws configure --profile alliance
#
# S3_BUCKET=s3://your-bucket/db-backups
# echo "[INFO] $(date): Syncing to object storage..."
# aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" --profile alliance
# echo "[INFO] $(date): Sync complete."

echo "[INFO] $(date): All done."
