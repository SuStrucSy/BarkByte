FROM node:lts-bookworm-slim  AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends

WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
# COPY package*.json yarn.lock ./

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

