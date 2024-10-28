FROM ubuntu:20.04 AS base

# Установка переменных для timezone и отключение интерактивных вопросов
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

# Обновление и установка необходимых пакетов для Node.js и WeasyPrint
RUN apt-get update && \
    apt-get install -y tzdata curl gnupg python3 python3-pip && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Включение pnpm
RUN corepack enable pnpm \
    && corepack prepare pnpm@latest --activate

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package.json ./

# Установка зависимостей для WeasyPrint
RUN apt-get install -y \
    libpango-1.0-0 \
    libharfbuzz0b \
    libpangoft2-1.0-0 \
    libffi-dev \
    libjpeg-dev \
    libopenjp2-7-dev \
    && pip3 install WeasyPrint==61.2 \
    && rm -rf /var/lib/apt/lists/*

# Проверка наличия команды weasyprint
RUN weasyprint --version
