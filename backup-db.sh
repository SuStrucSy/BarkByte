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

# --- Configuration -----------------------------------------------------------
BACKUP_DIR=~/backups
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Load database credentials from .env file in app directory
APP_DIR=~/your-app-repo
if [ -f "$APP_DIR/.env" ]; then
  export $(grep -E '^POSTGRES_(USER|PASSWORD|DB)' "$APP_DIR/.env" | xargs)
fi

# Auto-detect the running postgres container
CONTAINER=$(docker ps --filter "name=db" --format "{{.Names}}" | head -n 1)

# --- Validation --------------------------------------------------------------
if [ -z "$CONTAINER" ]; then
  echo "[ERROR] $(date): No running database container found. Is docker compose up?"
  exit 1
fi

if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ]; then
  echo "[ERROR] $(date): POSTGRES_USER or POSTGRES_DB not set. Check your .env file."
  exit 1
fi

# --- Backup ------------------------------------------------------------------
mkdir -p "$BACKUP_DIR"

echo "[INFO] $(date): Starting backup of database '$POSTGRES_DB' from container '$CONTAINER'..."

docker exec "$CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[INFO] $(date): Backup complete — $BACKUP_FILE ($BACKUP_SIZE)"

# --- Cleanup: delete backups older than RETENTION_DAYS -----------------------
echo "[INFO] $(date): Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "[INFO] $(date): Cleanup complete."

# --- Optional: sync to Alliance S3 object storage ---------------------------
# Uncomment and configure after running: aws configure --profile alliance
#
# S3_BUCKET=s3://your-bucket/db-backups
# echo "[INFO] $(date): Syncing to object storage..."
# aws s3 cp "$BACKUP_FILE" "$S3_BUCKET/" --profile alliance
# echo "[INFO] $(date): Sync complete."

echo "[INFO] $(date): All done."
