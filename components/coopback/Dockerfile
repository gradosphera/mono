FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable pnpm

WORKDIR /app

# Install dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && apk add --no-cache --virtual .build-deps \
    curl \
    && rm -rf /var/cache/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

# WORKDIR /usr/src/node-app

# COPY package.json pnpm-lock.yaml ./

# USER node

# FROM base AS prod-deps
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# FROM base AS build
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# COPY --chown=node:node . .

# EXPOSE 3000

# CMD ["npx", "ts-node", "src/index.ts"]
