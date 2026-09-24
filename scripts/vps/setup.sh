#!/usr/bin/env bash
# One-shot provisioning of a fresh Ubuntu 22.04/24.04 VPS for Lendisk.
# Usage (as root):  DOMAIN=lendisk.ru EMAIL=you@example.com bash setup.sh
# Re-running is safe: existing database, secrets and uploads are kept.
set -euo pipefail

DOMAIN="${DOMAIN:-lendisk.ru}"
EMAIL="${EMAIL:-}"
REPO="${REPO:-https://github.com/premiumautoru/lendisk.git}"
APP_DIR=/opt/lendisk
DATA_DIR=/var/lib/lendisk
ENV_FILE=/etc/lendisk.env

log() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }

log "System packages"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git nginx postgresql ufw certbot python3-certbot-nginx
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

log "Swap (Next.js build needs memory on small servers)"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

log "Firewall"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

log "App user and directories"
id lendisk >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin lendisk
mkdir -p "$DATA_DIR/uploads" "$DATA_DIR/backups"
chown -R lendisk:lendisk "$DATA_DIR"

log "Secrets and database"
if [ ! -f "$ENV_FILE" ]; then
  DB_PASS=$(openssl rand -hex 24)
  ADMIN_PASS="Lendisk-$(openssl rand -base64 18 | tr -dc 'A-Za-z0-9' | head -c 14)"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE USER lendisk WITH PASSWORD '$DB_PASS';"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE lendisk OWNER lendisk;"
  cat > "$ENV_FILE" <<EOF
DATABASE_URL="postgresql://lendisk:$DB_PASS@127.0.0.1:5432/lendisk"
AUTH_SECRET="$(openssl rand -base64 48 | tr -d '\n')"
ADMIN_LOGIN="admin"
ADMIN_PASSWORD="$ADMIN_PASS"
NEXT_PUBLIC_SITE_URL="https://$DOMAIN"
STORAGE_DRIVER="fs"
UPLOAD_DIR="$DATA_DIR/uploads"
NODE_ENV="production"
PORT="3000"
NEXT_TELEMETRY_DISABLED="1"
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
EOF
  chmod 600 "$ENV_FILE"
  echo "$ADMIN_PASS" > /root/lendisk-admin-password.txt
  chmod 600 /root/lendisk-admin-password.txt
fi

log "Code"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone --depth 1 "$REPO" "$APP_DIR"
fi
chown -R lendisk:lendisk "$APP_DIR"

log "Build"
install -m 755 "$APP_DIR/scripts/vps/deploy.sh" /usr/local/bin/lendisk-deploy
/usr/local/bin/lendisk-deploy --no-restart

log "Service"
cat > /etc/systemd/system/lendisk.service <<EOF
[Unit]
Description=Lendisk website (Next.js)
After=network.target postgresql.service

[Service]
User=lendisk
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now lendisk
systemctl restart lendisk

log "nginx"
cat > /etc/nginx/sites-available/lendisk <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    client_max_body_size 50m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
ln -sf /etc/nginx/sites-available/lendisk /etc/nginx/sites-enabled/lendisk
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

log "Daily database backup (03:30, keeps 14 days)"
cat > /etc/cron.d/lendisk-backup <<EOF
30 3 * * * postgres pg_dump -Fc lendisk > $DATA_DIR/backups/lendisk-\$(date +\%F).dump && find $DATA_DIR/backups -name '*.dump' -mtime +14 -delete
EOF
chown postgres:postgres "$DATA_DIR/backups"

log "HTTPS"
SERVER_IP=$(curl -s4 https://ifconfig.me || true)
DNS_IP=$(getent ahostsv4 "$DOMAIN" | awk 'NR==1{print $1}' || true)
if [ -n "$EMAIL" ] && [ "$SERVER_IP" = "$DNS_IP" ]; then
  certbot --nginx --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN" --redirect
else
  echo "Skipping SSL: DNS for $DOMAIN ($DNS_IP) does not point to this server ($SERVER_IP) yet, or EMAIL is empty."
  echo "Run later: certbot --nginx -d $DOMAIN -d www.$DOMAIN --redirect"
fi

log "Done"
echo "Site: http://$DOMAIN  (admin: /admin, password in /root/lendisk-admin-password.txt)"
