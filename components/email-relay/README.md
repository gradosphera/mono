# @coopenomics/email-relay

Минимальный **HTTP→SMTP релей**. Принимает письма по HTTPS с Bearer-токеном и
отправляет их по SMTP.

## Зачем

На хостингах многих кооперативов закрыт исходящий SMTP (25/465/587) — письма из
`controller` уходят в connection timeout. Открывать порты по тикету на каждом
сервере неудобно. Решение: один релей на сервере с открытыми портами (voskhod),
все коопы шлют письма ему по HTTPS, он форвардит по SMTP.

Раньше эту роль выполнял Novu — после его удаления нужен свой сервис.

## API

- `GET /health` → `{ "status": "ok" }`
- `POST /send` (требует `Authorization: Bearer <RELAY_TOKEN>`)
  ```json
  { "from": "...", "to": "...", "subject": "...", "html": "...", "text": "..." }
  ```
  `from` необязателен (берётся `EMAIL_FROM_DEFAULT`); нужно тело `html` или `text`.
  Ответ: `{ "delivered": true, "messageId": "..." }` либо `502` с `error`.

## Аутентификация

Статичный Bearer-токен поверх TLS (nginx + Let's Encrypt). Сравнение токена —
constant-time. Опционально IP-allowlist (`RELAY_IP_ALLOWLIST`). Ротация = смена
`RELAY_TOKEN` на релее и у всех коопов.

## Запуск

```bash
cp .env.example .env   # заполнить RELAY_TOKEN + SMTP_*
pnpm -F @coopenomics/email-relay dev    # разработка
pnpm -F @coopenomics/email-relay start  # прод
```

ENV — см. `.env.example`.

## Интеграция с controller

В `controller/.env` кооператива:

```
EMAIL_RELAY_URL=https://mail-relay.coopenomics.world/send
EMAIL_RELAY_TOKEN=<тот же RELAY_TOKEN>
```

Если `EMAIL_RELAY_URL` не задан — `controller` шлёт напрямую по SMTP (старое
поведение, без изменений).

## Деплой

- Образ: `dicoop/email-relay` (release-пайплайн, как остальные mono-сервисы).
- Плейбук: `playbooks/email-relay/setup.yaml` (nginx TLS + docker compose).
