---
tags:
  - Пайщик
  - Разработчик
---

Страница "Контакты" стола пайщика предоставляет контакты кооператива, а также его реквизиты:

![контакты кооператива](/assets/new/participant_contacts_1.png)

## Разработчикам

{{ dev_schema_source() }}

### Системная информация (контакты и сводка по кооперативу)

{{ get_sdk_doc("Queries", "System", "GetSystemInfo") }} | {{ get_graphql_doc("query.getSystemInfo") }}

{{ get_typedoc_desc("Queries.System.GetSystemInfo") }}

{{ get_typedoc_input("Queries.System.GetSystemInfo") }}

Результат:

{{ get_typedoc_definition("Queries.System.GetSystemInfo", "IOutput") }}

Публичные контакты и реквизиты на этой странице соответствуют полю `contacts` и связанным данным в типе `SystemInfo`.



