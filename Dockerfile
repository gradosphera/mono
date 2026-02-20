FROM node:20-slim AS builder

WORKDIR /app

# Сразу копируем все файлы
COPY . .

# Устанавливаем инструменты
RUN npm install -g pnpm lerna

# Установка зависимостей
# Используем версию pnpm, совместимую с существующим lock-файлом
RUN pnpm install

# Установка системных зависимостей для WeasyPrint и диагностических утилит (Debian/Ubuntu версии)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    g++ \
    python3-dev \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libcairo2-dev \
    libffi-dev \
    shared-mime-info \
    zlib1g-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    procps \
    wget \
    && python3 -m venv /venv \
    && /venv/bin/pip install WeasyPrint==67 \
    && rm -rf /var/lib/apt/lists/*

# Сборка всех компонентов
RUN lerna run build

# Финальный образ
FROM builder AS runtime

# Настройка переменных окружения
ENV PATH="/venv/bin:$PATH"

# Проверка WeasyPrint
RUN weasyprint --version