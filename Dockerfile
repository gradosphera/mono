#FROM node:20-alpine AS builder

FROM node:20-bookworm AS builder

WORKDIR /app

# Сразу копируем все файлы
COPY . .

# Устанавливаем инструменты
RUN npm install -g pnpm lerna

# Установка зависимостей
# Используем версию pnpm, совместимую с существующим lock-файлом
RUN pnpm install

# Установка системных зависимостей для WeasyPrint
RUN apk add --no-cache \
    python3 \
    py3-pip \
    gcc \
    musl-dev \
    python3-dev \
    pango \
    zlib-dev \
    jpeg-dev \
    openjpeg-dev \
    g++ \
    libffi-dev \
    harfbuzz-subset \
    && python3 -m venv /venv \
    && /venv/bin/pip install WeasyPrint==62.3 \
    && rm -rf /var/cache/*

# Сборка всех компонентов
RUN lerna run build

# Финальный образ
FROM builder AS runtime

# Настройка переменных окружения
ENV PATH="/venv/bin:$PATH"

# Проверка WeasyPrint
RUN weasyprint --version