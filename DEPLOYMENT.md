# Deploying Vision Mentors Group — visionmentors.org

Production stack: **Docker Compose** + **nginx edge proxy** + **Cloudflare** DNS/SSL.

| URL | Service |
|-----|---------|
| https://visionmentors.org | Public website |
| https://admin.visionmentors.org | Admin dashboard |
| https://visionmentors.org/api/v1/… | API (proxied through the website nginx) |

The API is **not** on a separate subdomain. Both frontends use `VITE_API_URL=/api/v1`, and nginx proxies `/api/` and `/uploads/` to the backend container.

---

## Architecture

```
Internet → Cloudflare (HTTPS) → VPS :80 → proxy (nginx)
                                              ├─ visionmentors.org      → ngo-website → backend (/api, /uploads)
                                              └─ admin.visionmentors.org → admin       → backend (/api, /uploads)
postgres (internal) ← backend
uploads_data volume ← backend
```

---

## 1. VPS requirements

- **Ubuntu 22.04 or 24.04**
- **2 vCPU, 4 GB RAM** minimum
- Ports **22**, **80** open (443 optional on origin — Cloudflare terminates HTTPS)

SSH into the server, then run:

```bash
apt update && apt upgrade -y
apt install -y git curl ufw
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
apt install -y docker-compose-plugin
docker compose version
ufw allow OpenSSH
ufw allow 80/tcp
ufw enable
```

---

## 2. Clone the project

```bash
cd /opt
git clone https://github.com/Omwansam/vision.git dan
cd dan
```

Confirm Docker files exist before building:

```bash
ls -la ngo-website/Dockerfile BACKEND/Dockerfile admin-client/admin/Dockerfile
```

---

## 3. Create `.env`

```bash
cp .env.example .env
nano .env
```

Generate two strong secrets (run twice, use one for each variable):

```bash
openssl rand -base64 48
```

### Required `.env` values

```env
POSTGRES_USER=dan
POSTGRES_PASSWORD=PASTE_FIRST_SECRET_HERE
POSTGRES_DB=vision

JWT_SECRET=PASTE_SECOND_SECRET_HERE
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://visionmentors.org,https://admin.visionmentors.org
VITE_API_URL=/api/v1
WEBSITE_URL=https://visionmentors.org
BACKEND_URL=https://visionmentors.org

HTTP_PORT=80

# SMTP — fill in for live email notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your@gmail.com
SMTP_FROM_NAME=Vision Mentors Group
ADMIN_NOTIFICATION_EMAIL=info@visionmentors.org
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

---

## 4. Cloudflare DNS

In the Cloudflare dashboard for **visionmentors.org**:

### DNS records (proxied — orange cloud ON)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `5.189.178.15` | Proxied |
| A | `www` | `5.189.178.15` | Proxied |
| A | `admin` | `5.189.178.15` | Proxied |

`www` redirects to `visionmentors.org` at the nginx edge.

### SSL/TLS settings

1. **SSL/TLS → Overview**: set encryption mode to **Full**
2. **SSL/TLS → Edge Certificates**: enable **Always Use HTTPS**
3. **Rules → Cache Rules** (recommended):
   - URI Path starts with `/api/` → **Bypass cache**
   - URI Path starts with `/uploads/` → **Bypass cache**

---

## 5. Deploy manually with Docker

All commands below are run from the project root on the VPS:

```bash
cd /opt/dan
```

### Step 1 — Build all images

```bash
docker compose build
```

This builds `backend`, `ngo-website`, and `admin`. The `proxy` service uses the official `nginx:1.27-alpine` image (no build).

To build one service at a time (if the VPS runs low on memory):

```bash
docker compose build backend
docker compose build ngo-website
docker compose build admin
```

### Step 2 — Start all containers

```bash
docker compose up -d
```

This starts:

| Container | Role |
|-----------|------|
| `postgres` | Database |
| `backend` | API (runs `prisma migrate deploy` on startup) |
| `ngo-website` | Public React site + nginx |
| `admin` | Admin dashboard + nginx |
| `proxy` | Edge nginx on port 80 |

### Step 3 — Check containers are running

```bash
docker compose ps
```

All services should show `running`. Wait until `backend` is `healthy` (may take 30–60 seconds on first start).

### Step 4 — Follow backend logs (first deploy)

Migrations run automatically when the backend starts. Watch for errors:

```bash
docker compose logs -f backend
```

Press `Ctrl+C` to stop following logs. You should see:

- `Running database migrations...`
- `Starting API server...`

### Step 5 — Confirm API health

```bash
docker compose exec backend node -e "fetch('http://127.0.0.1:5000/api/v1/health').then(r=>r.json()).then(console.log)"
```

Or through the edge proxy:

```bash
curl -s -H "Host: visionmentors.org" http://127.0.0.1/api/v1/health
```

Expected: JSON with `"message": "VMG API is running"`.

### Step 6 — Import gallery and page images (first deploy)

Copies images into `uploads/` and updates the database. Safe to re-run:

```bash
docker compose exec backend node scripts/import-content.js
```

### Step 7 — Seed the database (first deploy)

`BACKEND/prisma/seed.js` may be gitignored. If you have it on the server (copy from your dev machine if needed):

```bash
docker compose exec backend npx prisma db seed
```

This creates the admin user, programs, news, site settings, etc. Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` before seeding if your seed script uses them.

### Step 8 — Verify each layer

```bash
# All containers
docker compose ps

# Edge proxy → website
curl -I -H "Host: visionmentors.org" http://127.0.0.1/

# Edge proxy → admin
curl -I -H "Host: admin.visionmentors.org" http://127.0.0.1/

# API health via public hostname routing
curl -s -H "Host: visionmentors.org" http://127.0.0.1/api/v1/health

# Recent logs if anything fails
docker compose logs --tail=50 proxy
docker compose logs --tail=50 backend
docker compose logs --tail=50 ngo-website
docker compose logs --tail=50 admin
```

### Step 9 — Verify in the browser (after DNS propagates)

- https://visionmentors.org
- https://admin.visionmentors.org
- https://visionmentors.org/api/v1/health

---

## 6. Useful Docker commands

| Task | Command |
|------|---------|
| Start all services | `docker compose up -d` |
| Stop all services | `docker compose down` |
| Rebuild and restart | `docker compose up -d --build` |
| Rebuild one service | `docker compose up -d --build backend` |
| View all logs | `docker compose logs -f` |
| Backend logs only | `docker compose logs -f backend` |
| Restart one service | `docker compose restart backend` |
| Run migrations manually | `docker compose exec backend npx prisma migrate deploy` |
| Import images | `docker compose exec backend node scripts/import-content.js` |
| Seed database | `docker compose exec backend npx prisma db seed` |
| Shell into backend | `docker compose exec backend sh` |
| PostgreSQL shell | `docker compose exec postgres psql -U dan -d vision` |

---

## 7. Updating production

```bash
cd /opt/dan
git pull
docker compose build
docker compose up -d
```

If you changed `VITE_API_URL` or `FRONTEND_URL` in `.env`, rebuild the frontends:

```bash
docker compose build ngo-website admin
docker compose up -d ngo-website admin backend
```

If new gallery or page images were added in the repo:

```bash
docker compose exec backend node scripts/import-content.js
```

---

## 8. Local development without edge proxy

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
docker compose up -d --build
```

This exposes ports 5000, 5173, 5174 directly and skips the `proxy` container.

For day-to-day dev, use `npm run dev` in each app folder instead.

---

## 9. Backups

```bash
cd /opt/dan

# Database dump
docker compose exec -T postgres pg_dump -U dan vision > backup-$(date +%F).sql

# Uploads volume
docker run --rm -v dan_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

---

## 10. Troubleshooting

### Site loads but API fails

```bash
docker compose logs backend
docker compose up -d --build ngo-website admin
```

Confirm `.env` has `VITE_API_URL=/api/v1`.

### CORS errors

`FRONTEND_URL` must list exact origins (no trailing slash):

```env
FRONTEND_URL=https://visionmentors.org,https://admin.visionmentors.org
```

Then restart backend:

```bash
docker compose restart backend
```

### 502 Bad Gateway

```bash
docker compose ps
docker compose logs proxy backend ngo-website admin
docker compose restart backend proxy
```

### Cloudflare 521 / 522 (origin down)

- VPS firewall allows port 80: `ufw status`
- Proxy is running: `docker compose ps proxy`
- Cloudflare DNS A records point to `5.189.178.15`

### Backend won't start / migration errors

```bash
docker compose logs backend
docker compose exec backend npx prisma migrate deploy
```

### Images missing after deploy

```bash
docker compose exec backend node scripts/import-content.js
```

### Backend build fails at `npm ci` / `prisma generate`

Error: `Could not find Prisma Schema` during `docker compose build backend`.

Pull the latest code (the backend Dockerfile copies `prisma/` before `npm ci`):

```bash
cd /opt/dan
git pull
docker compose build backend
```

### ngo-website or admin build fails

```bash
cd /opt/dan
git pull
docker compose build ngo-website admin
```

### Out of memory during build

Build services one at a time:

```bash
docker compose build backend && docker compose build ngo-website && docker compose build admin
docker compose up -d
```

---

## 11. Quick checklist

- [ ] VPS with Docker and Docker Compose installed
- [ ] Repository cloned to `/opt/dan`
- [ ] `.env` created with strong `POSTGRES_PASSWORD` and `JWT_SECRET`
- [ ] Cloudflare A records: `@`, `www`, `admin` → `5.189.178.15` (proxied)
- [ ] Cloudflare SSL: **Full** + **Always Use HTTPS**
- [ ] Cache bypass for `/api/` and `/uploads/`
- [ ] `docker compose build` succeeds
- [ ] `docker compose up -d` — all containers running
- [ ] `docker compose exec backend node scripts/import-content.js` completed
- [ ] `docker compose exec backend npx prisma db seed` completed (first deploy)
- [ ] https://visionmentors.org/api/v1/health returns OK
