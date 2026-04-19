---
tags:
  - Разработчик
---

# Макросы документации (кратко)

Эти макросы подключаются через `main.py` и работают прямо в MD-файлах MkDocs.

- `{{ get_sdk_doc("Mutations", "Gateway", "CreateDepositPayment") }}` — ссылка на SDK. Используется полное имя из `docs/sdk/modules/*.html` без `.html`. Структура: `root namespace` (`Mutations`/`Queries`/`Classes`) → `подпространство` → `метод`.
- `{{ get_graphql_doc("Mutation.createDepositPayment") }}` — ссылка на SpectaQL. Формат: `Mutation|Query|Subscription.<имя_поля_как_в_схеме>`.
- `{{ get_typedoc_input("Mutations.Gateway.CreateDepositPayment") }}` — пример вызова с типами `IInput`.
- `{{ get_typedoc_definition("Mutations.Gateway.CreateDepositPayment", "IOutput") }}` — структура интерфейса (или любого указанного имени).
- `{{ get_typedoc_desc("Classes.Canvas") }}` / `{{ get_typedoc_value("Zeus.PaymentStatus") }}` — описание/значение из `typedoc.json`.
- `{{ get_class_doc("Classes", "Canvas") }}` — ссылка на класс или метод класса.

Разворачиваемые блоки (аккордионы) в MkDocs:

- Используйте HTML-детали:
  ```markdown
  <details>
  <summary>Результат</summary>

  {{ get_typedoc_definition("Mutations.Accounts.RegisterAccount", "IOutput") }}

  </details>
  ```

Файлы-источники:

- SDK HTML/typedoc: `docs/sdk/**` (ключи для `get_sdk_doc` = имена файлов без `.html`).
- GraphQL документация: `graphql/index.html` (якоря `mutation-...`, `query-...`).
- TypeDoc JSON: `mono-repo/components/sdk/docs/typedoc.json` (нужен для `get_typedoc_*`).

Быстрая проверка:

- `python check_all_links.py` — ищет все `get_sdk_doc` со сломанными ссылками.
- `python check_sdk_methods.py` — выводит найденные SDK-методы.
- `python check_sdk_methods2.py` — тестовые вызовы макроса по выбранным методам.
