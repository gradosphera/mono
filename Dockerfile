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

# Устанавливаем зависимости и очищаем кеш pnpm
RUN pnpm install --offline && pnpm store prune

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
    && pip cache purge \
    && rm -rf /var/cache/* /tmp/*

# Сборка всех компонентов
RUN pnpm run -r build

# Для каждого пакета создаем отдельные директории с необходимыми файлами
# Desktop - с ручным копированием src-ssr директории
RUN pnpm deploy --filter=@coopenomics/desktop --prod --legacy /prod/desktop && \
    rm -rf /tmp/* /var/tmp/* 

# Controller - с WeasyPrint
RUN pnpm deploy --filter=@coopenomics/controller --prod --legacy /prod/controller && \
    rm -rf /tmp/* /var/tmp/*

# Parser
RUN pnpm deploy --filter=@coopenomics/parser --prod --legacy /prod/parser && \
    rm -rf /tmp/* /var/tmp/*

# Notificator
RUN pnpm deploy --filter=coop-notificator --prod --legacy /prod/notificator && \
    rm -rf /tmp/* /var/tmp/*

# Очистка для уменьшения размера слоя
RUN rm -rf node_modules .git .github && \
    find /app -type d -name "node_modules" -exec rm -rf {} +

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