FROM node:20-bookworm AS builder

WORKDIR /app

# Сразу копируем все файлы
COPY . .

# Устанавливаем инструменты
RUN npm install -g pnpm lerna

# Установка зависимостей Node.js
RUN pnpm install

# Установка системных зависимостей для WeasyPrint в DEBIAN
# Используем apt-get вместо apk
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    # gcc и development tools
    gcc \
    g++ \
    python3-dev \
    # Библиотеки для WeasyPrint
    libpango-1.0-0 \
    libpango1.0-dev \
    libcairo2 \
    libcairo2-dev \
    libjpeg62-turbo \
    libjpeg62-turbo-dev \
    libopenjp2-7 \
    libopenjp2-7-dev \
    zlib1g \
    zlib1g-dev \
    libffi-dev \
    libharfbuzz0b \
    libharfbuzz-dev \
    # Чистим кэш
    && python3 -m venv /venv \
    && /venv/bin/pip install WeasyPrint==62.3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Сборка всех компонентов
RUN lerna run build

# Финальный образ
FROM node:20-bookworm-slim AS runtime

# Копируем из builder stage
COPY --from=builder /app /app
COPY --from=builder /venv /venv

WORKDIR /app

# Настройка переменных окружения
ENV PATH="/venv/bin:$PATH"

# Проверка WeasyPrint
RUN weasyprint --version