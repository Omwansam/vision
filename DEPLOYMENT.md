# Deploying Vision Mentors Group on a VPS (e.g. Hostinger)

This guide covers deploying the full stack on a Linux VPS with Docker:

| Service | Description | Default container port |
|---------|-------------|------------------------|
| **postgres** | PostgreSQL database | 5432 (internal) |
| **backend** | Express API + Prisma | 5000 |
| **ngo-website** | Public React site (nginx) | 80 |
| **admin** | Admin dashboard (nginx) | 80 |

Recommended production layout:

| URL | Service |
|-----|---------|
| `https://yourdomain.com` | Public website |
| `https://admin.yourdomain.com` | Admin panel |
| `https://api.yourdomain.com` | Backend API |

---

## 1. VPS requirements

Use a **Linux VPS** (Ubuntu 22.04 or 24.04 works well). On Hostinger:

1. Order a **VPS** plan (not shared hosting — this project needs Docker and a long-running Node process).
2. Choose **Ubuntu** as the OS.
3. Note the server **IP address** and **root** (or sudo) SSH credentials from the Hostinger panel.

Minimum suggested specs:

- 2 vCPU
- 4 GB RAM
- 40 GB SSD

---

## 2. Initial server setup

SSH into the server:

```bash
ssh root@YOUR_SERVER_IP
```

Update packages and install basics:

```bash
apt update && apt upgrade -y
apt install -y git curl ufw
```

### Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

Install the Docker Compose plugin:

```bash
apt install -y docker-compose-plugin
docker compose version
```

### Firewall

Allow SSH, HTTP, and HTTPS. Do **not** expose PostgreSQL publicly.

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 3. Clone the project

```bash
cd /opt
git clone https://github.com/YOUR_ORG/YOUR_REPO.git dan
cd dan
```

Replace the Git URL with your actual repository.

---

## 4. Configure environment variables

Secrets live only in `.env` on the server. That file is **never** committed to Git.

```bash
cp .env.example .env
nano .env
```

### Production example

Replace placeholders with your real domain and strong secrets:

```env
# PostgreSQL
POSTGRES_USER=dan
POSTGRES_PASSWORD=GENERATE_A_LONG_RANDOM_PASSWORD
POSTGRES_DB=vision
POSTGRES_PORT=5432

# Backend
JWT_SECRET=GENERATE_A_LONG_RANDOM_JWT_SECRET
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com,https://admin.yourdomain.com

# Internal Docker ports (host mapping)
BACKEND_PORT=5000
NGO_WEBSITE_PORT=5173
ADMIN_PORT=5174

# Public API URL — must match how browsers reach the API (HTTPS in production)
VITE_API_URL=https://api.yourdomain.com/api/v1
```

Generate strong secrets on the server:

```bash
openssl rand -base64 48
```

Run that twice — once for `POSTGRES_PASSWORD`, once for `JWT_SECRET`.

### Important notes

- `VITE_API_URL` is baked into the frontend images **at build time**. If you change the API domain, rebuild the frontend containers.
- `FRONTEND_URL` must list every origin that calls the API (CORS).
- `DATABASE_URL` is built automatically by `docker-compose.yml` — you do not need to set it in `.env`.

### Database seed (first deploy only)

The seed file (`BACKEND/prisma/seed.js`) is gitignored because it may contain sensitive defaults. Copy it to the server manually or create it from your local copy, then run:

```bash
docker compose exec backend npx prisma db seed
```

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env` before seeding if your seed script reads them.

---

## 5. Build and start with Docker Compose

From the project root (`/opt/dan`):

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
docker compose logs -f backend
```

The backend entrypoint runs `prisma migrate deploy` automatically on startup.

Verify locally on the server:

```bash
curl http://localhost:5000/api/v1/health
curl -I http://localhost:5173
curl -I http://localhost:5174
```

---

## 6. Point DNS to the VPS

In Hostinger (or your domain registrar), create **A records**:

| Host | Type | Value |
|------|------|-------|
| `@` | A | `YOUR_SERVER_IP` |
| `www` | A | `YOUR_SERVER_IP` |
| `api` | A | `YOUR_SERVER_IP` |
| `admin` | A | `YOUR_SERVER_IP` |

DNS can take up to 24 hours to propagate (often much faster).

---

## 7. Reverse proxy and HTTPS (nginx on the host)

The Docker containers listen on localhost ports. Put **nginx on the host** in front of them for HTTPS.

Install nginx and Certbot:

```bash
apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/dan`:

```nginx
# Public website
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin dashboard
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/dan /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Issue SSL certificates:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d admin.yourdomain.com -d api.yourdomain.com
```

Certbot will redirect HTTP to HTTPS and renew certificates automatically.

---

## 8. Hardening for production

### Do not expose PostgreSQL

In `docker-compose.yml`, remove or comment out the Postgres `ports` mapping so the database is only reachable inside the Docker network:

```yaml
# ports:
#   - "${POSTGRES_PORT:-5432}:5432"
```

Then restart:

```bash
docker compose up -d
```

### Keep secrets out of Git

- Commit only `.env.example` (placeholders).
- Never commit `.env`, `BACKEND/.env`, or `BACKEND/prisma/seed.js`.

### Restart policy

All services use `restart: unless-stopped`, so they come back after a server reboot.

### Optional: auto-start on boot

Docker is enabled via `systemctl enable docker`. Compose stacks with `restart: unless-stopped` will start when Docker starts.

---

## 9. Deploying updates

On the server:

```bash
cd /opt/dan
git pull
docker compose up -d --build
```

If you changed `VITE_API_URL` or `FRONTEND_URL`, rebuild is required:

```bash
docker compose up -d --build ngo-website admin backend
```

View logs after deploy:

```bash
docker compose logs -f --tail=100
```

---

## 10. Useful commands

| Task | Command |
|------|---------|
| Start all services | `docker compose up -d` |
| Stop all services | `docker compose down` |
| Rebuild after code changes | `docker compose up -d --build` |
| Backend logs | `docker compose logs -f backend` |
| Run migrations manually | `docker compose exec backend npx prisma migrate deploy` |
| Open DB shell | `docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"` |
| Check disk usage | `docker system df` |

---

## 11. Troubleshooting

### Frontend loads but API calls fail

- Confirm `VITE_API_URL` in `.env` matches the public API URL (`https://api.yourdomain.com/api/v1`).
- Rebuild frontends after changing it: `docker compose up -d --build ngo-website admin`.
- Check `FRONTEND_URL` includes both site origins for CORS.

### CORS errors in the browser

Ensure `FRONTEND_URL` lists the exact origins (scheme + domain, no trailing slash):

```env
FRONTEND_URL=https://yourdomain.com,https://admin.yourdomain.com
```

### Backend cannot connect to database

```bash
docker compose logs postgres
docker compose logs backend
```

Confirm `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` in `.env` are set and that the postgres container is healthy.

### 502 Bad Gateway from nginx

The upstream container may be down:

```bash
docker compose ps
curl http://127.0.0.1:5000/api/v1/health
```

Restart if needed:

```bash
docker compose restart backend ngo-website admin
```

### Out of memory during build

Hostinger smaller VPS plans may struggle with parallel builds:

```bash
docker compose build backend
docker compose build ngo-website
docker compose build admin
docker compose up -d
```

---

## 12. Hostinger-specific tips

- Use the **VPS** product, not shared web hosting — this stack needs Docker and custom nginx config.
- SSH access is under **VPS → Manage → SSH Access** in hPanel.
- If you use Hostinger’s firewall panel, allow ports **22**, **80**, and **443** only.
- Back up the Postgres volume regularly:

  ```bash
  docker compose exec postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup.sql
  ```

---

## Quick checklist

- [ ] VPS provisioned with Ubuntu
- [ ] Docker and Docker Compose installed
- [ ] Repository cloned to `/opt/dan`
- [ ] `.env` created with strong secrets
- [ ] DNS A records for `@`, `www`, `api`, `admin`
- [ ] `docker compose up -d --build` succeeds
- [ ] Host nginx reverse proxy configured
- [ ] SSL certificates issued with Certbot
- [ ] PostgreSQL port not exposed publicly
- [ ] Health check: `https://api.yourdomain.com/api/v1/health`
