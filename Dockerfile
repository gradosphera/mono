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

# Проверяем, что middleware файлы существуют перед установкой
RUN echo "Проверка файлов middleware:" && \
    ls -la components/desktop/src-ssr/middleware/ || echo "Директория middleware не найдена!"

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

# Проверяем, что файлы middleware все еще существуют после сборки
RUN echo "Проверка файлов middleware после сборки:" && \
    ls -la components/desktop/src-ssr/middleware/ || echo "Директория middleware не найдена после сборки!"

# Деплоим каждый компонент в отдельную директорию с только необходимыми зависимостями
RUN pnpm deploy --filter=@coopenomics/desktop --prod --legacy /prod/desktop

# Проверяем содержимое после pnpm deploy
RUN echo "Содержимое /prod/desktop:" && \
    ls -la /prod/desktop && \
    echo "Содержимое /prod/desktop/src-ssr (если существует):" && \
    ls -la /prod/desktop/src-ssr/ || echo "Директория src-ssr не найдена в /prod/desktop!"
    
# Копируем middleware директорию вручную, если pnpm deploy не включил ее
RUN if [ -d "components/desktop/src-ssr/middleware" ] && [ ! -d "/prod/desktop/src-ssr/middleware" ]; then \
      echo "Создаем директорию middleware вручную"; \
      mkdir -p /prod/desktop/src-ssr/middleware && \
      cp -r components/desktop/src-ssr/middleware/* /prod/desktop/src-ssr/middleware/; \
    fi

RUN pnpm deploy --filter=@coopenomics/controller --prod --legacy /prod/controller
RUN pnpm deploy --filter=@coopenomics/parser --prod --legacy /prod/parser
RUN pnpm deploy --filter=coop-notificator --prod --legacy /prod/notificator

# Образ для desktop
FROM base AS desktop
# Копируем собранное приложение
COPY --from=build /prod/desktop /app
WORKDIR /app
# Проверяем содержимое финального образа
RUN echo "Содержимое /app/src-ssr:" && \
    ls -la /app/src-ssr/ || echo "Директория src-ssr не найдена в финальном образе!" && \
    echo "Содержимое /app/src-ssr/middleware (если существует):" && \
    ls -la /app/src-ssr/middleware/ || echo "Директория middleware не найдена в финальном образе!"
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