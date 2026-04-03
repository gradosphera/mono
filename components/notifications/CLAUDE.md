# @coopenomics/notifications — шаблоны Novu

## Надо

- Переменные: `{{payload.field}}` (как в существующих workflow).
- Условия и ветвление: **LiquidJS** — `{% if payload.details %}…{% endif %}`, циклы/фильтры — синтаксис Liquid.

## Нельзя

- **Handlebars** в телах шагов: `{{#if …}}`, `{{/if}}`, `{{#each …}}` — Novu это не парсит как Handlebars; получишь ошибку вида *invalid value expression: "#if payload.details"*.
