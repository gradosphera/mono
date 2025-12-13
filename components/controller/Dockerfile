# Базовый образ Node.js на Alpine
FROM node:20-alpine

# Включение pnpm
# Устанавливаем pnpm без использования corepack
RUN npm install -g pnpm@8.15.4


# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Установка системных зависимостей для WeasyPrint и создание виртуального окружения
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

# Установка пути к виртуальному окружению в PATH
ENV PATH="/venv/bin:$PATH"

# Проверка наличия команды weasyprint
RUN weasyprint --version

# CMD для запуска weasyprint
# CMD ["weasyprint", "input.html", "output.pdf"]
