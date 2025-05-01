FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app

# Сначала копируем только файлы для установки зависимостей
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
RUN pnpm fetch

# Копируем весь код
COPY . .

# Устанавливаем зависимости
RUN pnpm install --offline

# Устанавливаем системные зависимости для WeasyPrint (только для controller)
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
RUN pnpm run -r build

# Деплоим каждый компонент в отдельную директорию с только необходимыми зависимостями
RUN pnpm deploy --filter=@coopenomics/desktop --prod --legacy /prod/desktop
RUN pnpm deploy --filter=@coopenomics/controller --prod --legacy /prod/controller
RUN pnpm deploy --filter=@coopenomics/parser --prod --legacy /prod/parser
RUN pnpm deploy --filter=coop-notificator --prod --legacy /prod/notificator

# Образ для desktop
FROM base AS desktop
# Копируем собранное приложение
COPY --from=build /prod/desktop /app
WORKDIR /app
CMD ["pnpm", "run", "start"]

# Образ для controller
FROM base AS controller
# Копируем WeasyPrint из сборочного образа - нужен только для controller
COPY --from=build /venv /venv
ENV PATH="/venv/bin:$PATH"
# Копируем собранное приложение
COPY --from=build /prod/controller /app
WORKDIR /app
CMD ["pnpm", "run", "start"]

# Образ для parser
FROM base AS parser
# Копируем собранное приложение
COPY --from=build /prod/parser /app
WORKDIR /app
CMD ["pnpm", "run", "start"]

# Образ для notificator
FROM base AS notificator
# Копируем собранное приложение
COPY --from=build /prod/notificator /app
WORKDIR /app
CMD ["pnpm", "run", "start"]