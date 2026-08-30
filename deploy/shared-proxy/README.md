# Shared-proxy deployment artifacts

Copies of the files that adapt this stack to a host where it is **not** the only tenant and
does **not** own ports 80/443. They live here so the deployment is reproducible from git;
the live copies are elsewhere on the server and are the ones actually read.

Current deployment (2.24.114.80), where the edge proxy belongs to the FIBI stack in
`/opt/fibi/FIBI`:

| This file | Lives on the server at | Read by |
|-----------|------------------------|---------|
| `docker-compose.override.example.yml` | `/srv/dan/vision/docker-compose.override.yml` | compose, automatically |
| `vhosts/10-dan-http.conf` | `/srv/dan/deploy/vhosts/10-dan-http.conf` | the shared proxy, bind-mounted read-only |
| `vhosts/20-dan-https.conf` | `/srv/dan/deploy/vhosts/20-dan-https.conf` | the shared proxy, bind-mounted read-only |

The vhosts deliberately sit **outside** the git checkout on the server, so `git pull` can
never revert or delete them. That is also why they are copies here rather than symlink
targets — edit the live file, then update the copy here.

Two edits to the proxy stack itself are **not** captured here, because they belong to
another project's repository (`/opt/fibi/FIBI`):

- `deploy/nginx.conf` — `include /etc/nginx/conf.d/vhosts-dan/*.conf;`
- `docker-compose.yml` — `- /srv/dan/deploy/vhosts:/etc/nginx/conf.d/vhosts-dan:ro`

See `DEPLOYMENT.md` §1 and §3 for the full procedure and the reasoning behind the `dan-*`
aliases, which are the part most likely to be broken by a well-meaning simplification.
