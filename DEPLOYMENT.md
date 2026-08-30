# Deploying Vision Mentors Group — visionmentors.org

Production stack: **Docker Compose**, behind an **nginx edge proxy that this project does
not own**, with **Cloudflare** in front for DNS and CDN.

| URL | Service |
|-----|---------|
| https://visionmentors.org | Public website |
| https://admin.visionmentors.org | Admin dashboard |
| https://visionmentors.org/api/v1/… | API |

The API is **not** on a separate subdomain. Both frontends are built with
`VITE_API_URL=/api/v1`, so the browser always calls the same origin it loaded from, and the
edge proxy routes `/api/`, `/uploads/` and `/branding/` to the backend.

---

## 1. The shared host

This stack is one of **three** tenants on the server, and it is not the one that owns
ports 80 and 443.

| Stack | Location | Owns |
|-------|----------|------|
| FIBI (`fibicommunity.org`) | `/opt/fibi/FIBI` | **the edge proxy**, `fibi-proxy-1`, ports 80 + 443, and the Let's Encrypt volume |
| DraftBit (`draftbitlabs.tech`) | `/srv/draftbit` | its own app containers |
| **Vision Mentors (this)** | **`/srv/dan/vision`** | its own app containers |

```
Internet → Cloudflare → :80/:443 → fibi-proxy-1 (nginx, /opt/fibi/FIBI)
                                     ├─ fibicommunity.org        → FIBI stack
                                     ├─ draftbitlabs.tech        → DraftBit stack
                                     ├─ visionmentors.org        → dan-website ─┐
                                     └─ admin.visionmentors.org  → dan-admin ───┤
                                        /api/ /uploads/ /branding/ → dan-backend ┘
                                                                        │
                                            dan-postgres ───────────────┘
                                            uploads volume ─────────────┘
```

### How this stack attaches to that proxy

Three moving parts, all already in place:

1. **`docker-compose.override.yml`** (server-only, gitignored) parks this project's own
   `proxy` service behind a `standalone-only` profile so it never starts, and joins
   `backend`, `ngo-website` and `admin` to the external `fibi_internal` network.
2. **`/srv/dan/deploy/vhosts/`** holds this site's nginx server blocks. It is bind-mounted
   read-only into the shared proxy at `/etc/nginx/conf.d/vhosts-dan`, which
   `/opt/fibi/FIBI/deploy/nginx.conf` pulls in with a glob.
3. **Aliases.** Every service is addressed as `dan-*`, never by its bare service name.

That third point is not cosmetic — see below.

### Never use bare service names on this host

Docker's embedded DNS answers a service name with **every** container carrying it, across
every network the querying container is attached to. All three stacks on this box call
their API service `backend` and two call their database `postgres`. An unprefixed name
silently becomes a multi-member round-robin pool spanning unrelated applications — FIBI hit
exactly this once, and half its API requests were answered by a neighbour's API.

So `docker-compose.yml` gives every service a unique alias on the `dan` network, and
everything addresses those:

| Service | Alias | Addressed by |
|---------|-------|--------------|
| `postgres` | `dan-postgres` | `DATABASE_URL` |
| `backend` | `dan-backend` | the edge vhost, and both frontends' internal nginx |
| `ngo-website` | `dan-website` | the edge vhost |
| `admin` | `dan-admin` | the edge vhost |

The aliases live in the **base** compose file, not the override, so a standalone deploy
resolves the same names and the frontend images are byte-identical either way.

Verify at any time — each must return exactly one address:

```bash
for n in dan-postgres dan-backend dan-website dan-admin; do
  printf '%-14s ' "$n"; docker exec fibi-proxy-1 getent hosts "$n" | awk '{printf "%s ", $1}'; echo
done
```

---

## 2. Layout on the server

```
/srv/dan/
├── vision/                     the git checkout — `git pull` territory
│   ├── .env                    secrets, chmod 600, gitignored
│   ├── docker-compose.override.yml   shared-proxy adaptation, gitignored
│   └── …
└── deploy/                     deliberately OUTSIDE the checkout, so `git pull`
    ├── vhosts/                 can never revert or delete it
    │   └── 10-dan-http.conf    port 80: ACME + redirect to HTTPS
    │   └── 20-dan-https.conf   port 443: the three server blocks
    └── vhosts-pending/         staging for a vhost whose certificate is not yet issued
```

Compose project name is pinned to `dan` in the override. Without it the project would be
named after the directory (`vision`) and the containers and volumes would not match the
`dan-*` names used everywhere else. Containers are `dan-backend-1` etc.; volumes are
`dan_postgres_data` and `dan_uploads_data`.

---

## 3. First deploy, start to finish

### 3.1 Code

The repo is private and the server has no push credentials, and `BACKEND/prisma/seed.js` is
gitignored — so the seed file is copied separately, every time it changes.

```bash
cd /srv/dan/vision
git pull --ff-only origin main
```

```bash
# from your workstation
scp BACKEND/prisma/seed.js fibidev@2.24.114.80:/srv/dan/vision/BACKEND/prisma/seed.js
```

### 3.2 `.env`

```bash
cp .env.example .env
chmod 600 .env
```

Generate the two secrets separately:

```bash
openssl rand -hex 32        # POSTGRES_PASSWORD — hex, not base64
openssl rand -base64 48     # JWT_SECRET
```

`POSTGRES_PASSWORD` must be **hex or otherwise URL-safe**. It is interpolated straight into
`DATABASE_URL`, where base64's `+` and `/` would have to be percent-encoded and will
otherwise break the connection string.

Required values:

```env
POSTGRES_USER=dan
POSTGRES_DB=vision
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://visionmentors.org,https://admin.visionmentors.org
VITE_API_URL=/api/v1
WEBSITE_URL=https://visionmentors.org
BACKEND_URL=https://visionmentors.org

SEED_ADMIN_EMAIL=admin@visionmentorsgroup.org
SEED_ADMIN_PASSWORD=<set this — the seed silently falls back to `changeme123`>

INIT_CONTENT=false
```

`HTTP_PORT` / `HTTPS_PORT` are unused here; nothing in this project binds a host port.

### 3.3 Build and start

Build one service at a time. The box has 2 vCPU and **no swap**, and the two Vite builds
are the memory peak.

```bash
cd /srv/dan/vision
docker compose config --services      # must NOT list `proxy`
docker compose build backend
docker compose build ngo-website
docker compose build admin
docker compose up -d
docker compose ps                     # wait for backend => healthy
```

Migrations run automatically from the entrypoint. Confirm the backend reached **its own**
database, not a neighbour's:

```bash
docker compose exec backend sh -c 'echo $DATABASE_URL'   # must say dan-postgres
docker compose exec postgres psql -U dan -d vision -c '\dt'
```

Confirm the shared proxy can see all three, before any traffic is routed to them:

```bash
docker exec fibi-proxy-1 wget -qO- http://dan-backend:5000/api/v1/health
docker exec fibi-proxy-1 wget -qS -O /dev/null http://dan-website:80/
docker exec fibi-proxy-1 wget -qS -O /dev/null http://dan-admin:80/
```

### 3.4 Seed, then import content — in that order

`seed.js` is excluded by `BACKEND/.dockerignore`, so it is not in the image and has to be
copied into the running container:

```bash
docker compose cp BACKEND/prisma/seed.js backend:/app/prisma/seed.js
docker compose exec backend node prisma/seed.js
docker compose exec backend node scripts/import-content.js
```

**The order matters and is easy to get wrong.** `import-content.js` resolves programs and
news by slug and skips with a warning when the row is absent, so running it against an empty
database imports gallery and site images only — programs and news keep placeholder artwork.
Its output must read `Updated 3 program(s).` and `Updated 4 news article(s).`; zeroes mean
it ran too early.

This is also why `INIT_CONTENT` stays `false`: setting it `true` makes the entrypoint run
the import at container start, which is *before* any seed can have run.

### 3.5 TLS

Certificates are issued into the FIBI stack's `fibi_letsencrypt_certs` volume and renewed by
its already-running `fibi-certbot-1`, which walks every lineage on that volume. The proxy
reloads itself every 6 hours to pick renewals up. **Nothing site-specific has to be
scheduled.**

Issuance is HTTP-01 against the shared webroot, so the challenge has to reach this origin:

1. In Cloudflare, point `@`, `www` and `admin` at the server IP and set all three to
   **DNS only (grey cloud)**. With the orange cloud on, Cloudflare answers the challenge at
   its own edge, or redirects it to a port 443 that has no certificate yet.
2. Install `10-dan-http.conf` only. Its `/.well-known/acme-challenge/` block must sit
   **above** the HTTPS redirect and must never be redirected — renewal happens exactly when
   the current certificate is closest to expiring.
3. Issue:

```bash
docker run --rm \
  -v fibi_letsencrypt_certs:/etc/letsencrypt \
  -v fibi_certbot_webroot:/var/www/certbot \
  certbot/certbot:latest certonly --webroot -w /var/www/certbot \
  -d visionmentors.org -d www.visionmentors.org -d admin.visionmentors.org \
  --email <a mailbox you read> --agree-tos --no-eff-email
```

   Add `--staging` first if you are unsure: Let's Encrypt allows only 5 failed validations
   per hostname per hour.

4. Move `20-dan-https.conf` into `vhosts/`, validate, reload:

```bash
mv /srv/dan/deploy/vhosts-pending/20-dan-https.conf /srv/dan/deploy/vhosts/
docker exec fibi-proxy-1 nginx -t && docker exec fibi-proxy-1 nginx -s reload
```

5. Back in Cloudflare: re-enable the orange cloud on all three records, set SSL/TLS mode to
   **Full (strict)**, and turn on **Always Use HTTPS**.

The HTTPS vhost is kept in a separate file from the HTTP one, and staged in
`vhosts-pending/` until the certificate exists, for one reason: **nginx refuses to start
when a server block names a certificate that is not on disk.** Installing it early does not
just break this site — it stops the shared proxy from booting and takes
`fibicommunity.org` and `draftbitlabs.tech` down with it.

### 3.6 Cloudflare cache

Rules → Cache Rules:

- URI Path starts with `/api/` → **Bypass cache**
- URI Path starts with `/uploads/` → **Bypass cache**

The `/uploads/` bypass gives up edge caching for uploaded media, but avoids stale images
after an admin replaces a file under the same name.

---

## 4. Routine operations

All from `/srv/dan/vision`.

| Task | Command |
|------|---------|
| Status | `docker compose ps` |
| Follow API logs | `docker compose logs -f backend` |
| Restart the API | `docker compose restart backend` |
| Deploy code changes | `git pull && docker compose up -d --build` |
| Rebuild frontends only | `docker compose up -d --build ngo-website admin` |
| Run migrations by hand | `docker compose exec backend npx prisma migrate deploy` |
| Re-import content images | `docker compose exec backend node scripts/import-content.js` |
| Create an extra admin | `docker compose exec backend node scripts/create-admin.js --email x@y.z --generate` |
| Postgres shell | `docker compose exec postgres psql -U dan -d vision` |

`docker compose down` / `stop` / `restart` are all **safe** here: the `proxy` service is
profile-disabled, so compose in this directory cannot touch the shared edge. (Earlier notes
in this file warned otherwise — that applied to the previous server, where this project
owned the proxy.) Named volumes survive `down`.

After changing `VITE_API_URL` or `FRONTEND_URL`, the frontends must be **rebuilt**, not just
restarted — those values are baked in at image build time:

```bash
docker compose build ngo-website admin && docker compose up -d ngo-website admin backend
```

### Changing nginx routing

Edit the files in `/srv/dan/deploy/vhosts/`, then validate and reload. Never restart the
proxy container for a config change — a reload is graceful and never drops a connection on
the other two sites:

```bash
docker exec fibi-proxy-1 nginx -t
docker exec fibi-proxy-1 nginx -s reload
```

`nginx -t` is not optional. A bad config that is only caught at *startup* leaves all three
sites down until it is fixed.

### Touching the shared proxy container

Rare — only to add or remove a mount in `/opt/fibi/FIBI/docker-compose.yml`. It costs about
two seconds of downtime **for every site on the box**, so back the file up, dry-run the
rendered config first, and only then recreate:

```bash
docker run --rm --network fibi_internal \
  -v /opt/fibi/FIBI/deploy/nginx.conf:/etc/nginx/templates/nginx.conf.template:ro \
  -v /opt/fibi/FIBI/deploy/ssl-params.conf:/etc/nginx/conf.d/ssl-params.conf:ro \
  -v /srv/draftbit/deploy/vhosts:/etc/nginx/conf.d/vhosts:ro \
  -v /srv/dan/deploy/vhosts:/etc/nginx/conf.d/vhosts-dan:ro \
  -v fibi_letsencrypt_certs:/etc/letsencrypt:ro \
  -e DOMAIN=fibicommunity.org --entrypoint sh nginx:1.27-alpine -c \
  'envsubst "\$DOMAIN" < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf \
   && : > /etc/nginx/conf.d/realip.conf && nginx -t'

cd /opt/fibi/FIBI && docker compose up -d --no-deps proxy
```

The `--network fibi_internal` is required: nginx resolves `upstream` hostnames at parse
time, so off that network the test fails on names that are actually fine.

### Reboots

Every service is `restart: unless-stopped`, and that is literal — after an explicit
`docker compose stop`, Docker will **not** bring the containers back after a reboot. If the
site is down after one, `docker compose ps` then `docker compose up -d`.

---

## 5. Backups

```bash
cd /srv/dan/vision

docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  > ~/dan-backup-$(date +%F-%H%M).sql

docker run --rm -v dan_uploads_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

`docker compose down -v` destroys `dan_postgres_data` and `dan_uploads_data` — the entire
database and every uploaded file, with no undo. There is no routine reason to use `-v`.

---

## 6. Troubleshooting

**502 on this site only.** The app containers are down; the proxy is fine and the other two
sites are unaffected (the vhost uses named upstreams that simply fail to connect).

```bash
docker compose ps && docker compose logs --tail=50 backend
```

**The API returns another application's data, or "not found" for things that exist.**
A bare service name has crept back into a config. Re-run the alias check in §1.

**CORS errors.** `FRONTEND_URL` must list exact origins, no trailing slash, then
`docker compose restart backend`.

**Images missing after a deploy.** `docker compose exec backend node scripts/import-content.js`
— and check its output says `Updated 3 program(s).`, not zero (§3.4).

**Emails have broken artwork.** The `/branding/` location is missing from the vhost;
`BACKEND_URL` links resolve to the SPA's `index.html` instead of the backend.

**Certificate expiring.** Renewal is automatic. To check:

```bash
docker run --rm -v fibi_letsencrypt_certs:/etc/letsencrypt certbot/certbot:latest certificates
docker logs --tail=50 fibi-certbot-1
```

**Cloudflare 521/522.** Origin unreachable: check `fibi-proxy-1` is up, and that the A
records still point at this server.

---

## 7. Standalone deploy (a server of its own)

Everything above describes the shared host. On a box where this stack is alone, delete
`docker-compose.override.yml`: the bundled `proxy` service comes back, binds 80/443, and
uses `deploy/nginx/` — which is retained for exactly that case and is unused here.
