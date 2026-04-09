FROM node:lts-bookworm-slim AS base

# ── deps stage: install dependencies ──────────────────────────────────────────
FROM base AS deps

WORKDIR /app

# Update npm and install globals as root before switching user
RUN npm install -g npm@latest npm-check-updates

# Copy package files and install deps as root into /app
COPY package.json package-lock.json ./
RUN npm install

# Fix ownership once on the populated directory
RUN chown -R node:node /app

# ── build stage: compile the app ──────────────────────────────────────────────
FROM base AS build

WORKDIR /app

# Copy node_modules from deps stage (already correct ownership)
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Switch to node user before copying source
USER node

# Copy source and build
COPY --chown=node:node . .

ARG VITE_API_URL
ARG NODE_ENV
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=$NODE_ENV

RUN npm run build

# ── production stage: serve with nginx ────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
