#!/usr/bin/env bash
# Generate a self-signed origin certificate for Cloudflare "Full" SSL mode.
# Cloudflare Full (not strict) accepts this. For Full (strict), use a
# Cloudflare Origin Certificate instead: SSL/TLS → Origin Server → Create.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSL_DIR="${SCRIPT_DIR}/ssl"
mkdir -p "${SSL_DIR}"

if [[ -f "${SSL_DIR}/origin.crt" && -f "${SSL_DIR}/origin.key" ]]; then
  echo "Origin certificate already exists at ${SSL_DIR}/"
  exit 0
fi

openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout "${SSL_DIR}/origin.key" \
  -out "${SSL_DIR}/origin.crt" \
  -subj "/CN=visionmentors.org/O=Vision Mentors Group" \
  -addext "subjectAltName=DNS:visionmentors.org,DNS:www.visionmentors.org,DNS:admin.visionmentors.org"

chmod 600 "${SSL_DIR}/origin.key"
echo "Created ${SSL_DIR}/origin.crt and origin.key"
