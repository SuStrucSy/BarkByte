FROM node:lts-bookworm-slim AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends

# Set the working directory in the container
WORKDIR /app

# Update npm to the latest version
RUN npm install -g npm@latest

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Change ownership of the /app directory
RUN chown -R node:node /app

# Use the node user from the image (instead of the root user)
USER node

# Bundle app source
COPY --chown=node:node . .

# Expose the port that Vite will run on
EXPOSE 5173



