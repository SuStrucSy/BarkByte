FROM node:lts-bookworm-slim AS base

# ── deps stage: install dependencies ──────────────────────────────────────────
FROM base AS deps

WORKDIR /app

# Chown the empty /app dir before any files land in it — instant
RUN chown node:node /app

# Switch to node user before installing dependencies
USER node

# Copy package files and install as node user — no chown needed after
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# ── build stage: compile the app ──────────────────────────────────────────────
FROM base AS build

WORKDIR /app

# Create /app and give node user ownership before switching
RUN chown node:node /app

COPY --from=deps --chown=node:node /app/node_modules ./node_modules

USER node

COPY --chown=node:node . .

ARG VITE_API_URL
ARG NODE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# ── production stage: serve with nginx ────────────────────────────────────────
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
