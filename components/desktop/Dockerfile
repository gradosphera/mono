FROM node:20-slim AS base

# Устанавливаем PNPM напрямую без Corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@8.15.4

WORKDIR /app

COPY package.json ./
RUN pnpm install