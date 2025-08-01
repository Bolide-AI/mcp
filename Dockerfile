# Generated by https://smithery.ai. See: https://smithery.ai/docs/build/project-config
# Use a small base image with Node.js LTS
FROM node:lts-alpine AS build

# Install dependencies needed for building
RUN apk add --no-cache python3 g++ make git

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package.json package-lock.json tsconfig.json eslint.config.js ./

# Copy source
COPY src ./src

# Install dependencies ignoring any prepare scripts, then build
RUN npm ci --ignore-scripts
RUN npm run npm run build

# Stage for runtime
FROM node:lts-alpine
WORKDIR /usr/src/app

# Install minimal runtime dependencies
# No build tools needed, install production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy built files
COPY --from=build /usr/src/app/build ./build

# Symlink binary
RUN npm link

# Default command
ENTRYPOINT ["bolide-ai-mcp"]
CMD []
