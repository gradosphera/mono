FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только конфигурационные файлы сначала
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY components/*/package.json ./components/temp/
# Восстановление структуры директорий
RUN for file in ./components/temp/*.json; do \
      dir=$(basename $(dirname $file)); \
      mkdir -p ./components/$dir; \
      mv $file ./components/$dir/package.json; \
    done && \
    rm -rf ./components/temp

# Устанавливаем инструменты и зависимости
RUN npm install -g pnpm@8 lerna@7
RUN pnpm install --force

# Копируем весь исходный код
COPY . .

# Установка WeasyPrint
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

# Финальная стадия - общий образ
FROM builder AS runtime

ENV PATH="/venv/bin:$PATH"

# Проверка WeasyPrint
RUN weasyprint --version