FROM node:20-slim AS builder

WORKDIR /app

# Сразу копируем все файлы
COPY . .

# Устанавливаем инструменты
RUN npm install -g pnpm lerna

# Установка зависимостей
# Используем версию pnpm, совместимую с существующим lock-файлом
RUN pnpm install

# Установка системных зависимостей для WeasyPrint
RUN apt-get update && apt-get install -y \
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
    && /venv/bin/pip install WeasyPrint==67 \
    && rm -rf /var/cache/*

# Сборка всех компонентов
RUN lerna run build

# Финальный образ
FROM builder AS runtime

# Настройка переменных окружения
ENV PATH="/venv/bin:$PATH"

# Проверка WeasyPrint
RUN weasyprint --version
