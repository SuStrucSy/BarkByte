FROM node:lts-bookworm-slim AS base

# 1. Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends

# Set the working directory in the container
WORKDIR /app

# Update npm to the latest version
RUN npm install -g npm@latest

# Install npm-check-updates globally
RUN npm install -g npm-check-updates

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json ./

# Run npm-check-updates to upgrade package.json versions
#RUN ncu -u

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

# Start Vite on all interfaces so Docker port mapping works
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
