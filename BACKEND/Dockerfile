FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Prisma schema must exist before `npm ci` — postinstall runs `prisma generate`.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

COPY . .

EXPOSE 5000

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "index.js"]
