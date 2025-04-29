FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install -g pnpm lerna

# Установка всех зависимостей
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

# Последовательная сборка библиотек в правильном порядке
RUN lerna run build

# Путь к виртуальному окружению
ENV PATH="/venv/bin:$PATH"

# Проверка наличия weasyprint
RUN weasyprint --version