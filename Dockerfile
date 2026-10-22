# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Identificador público del botón de Google. No es un secreto:
# Vite lo deja dentro del JavaScript que el navegador descarga.
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN useradd --uid 1001 --no-create-home --shell /usr/sbin/nologin oasis

COPY --from=builder --chown=oasis:oasis /app/package.json ./package.json
COPY --from=builder --chown=oasis:oasis /app/node_modules ./node_modules
COPY --from=builder --chown=oasis:oasis /app/dist ./dist
COPY --from=builder --chown=oasis:oasis /app/client/dist ./client/dist

USER oasis
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.js"]
