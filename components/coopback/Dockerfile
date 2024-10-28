# Базовый образ Node.js
FROM node:alpine AS base

# Включение pnpm
RUN corepack enable pnpm \
    && corepack prepare pnpm@latest --activate

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Установка зависимостей для WeasyPrint
RUN apk add --no-cache \
    python3 \
    py3-pip \
    libpango \
    libcairo \
    libffi \
    libjpeg-turbo \
    gdk-pixbuf \
    pango \
    cairo \
    libxml2 \
    libxslt \
    libressl \
    && pip3 install WeasyPrint==62.3 \
    && rm -rf /var/cache/*

