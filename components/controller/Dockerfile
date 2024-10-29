FROM node:18-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable pnpm \
    && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json ./