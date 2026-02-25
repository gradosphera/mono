FROM node:20-slim AS base

# Устанавливаем PNPM напрямую без Corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@8.15.4

WORKDIR /app

# Поскольку volumes монтируют весь проект, зависимости устанавливаются в runtime
# Ничего не копируем и не устанавливаем на этапе сборки
