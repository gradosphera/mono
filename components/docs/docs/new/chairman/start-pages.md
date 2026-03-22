---
tags:
  - Председатель
  - Разработчик
---

Стартовые страницы указывают на то, какие маршруты используются для авторизованных и не авторизованных пользователей. Председатель, изменяя их - изменяет страницы, которые видят пользователи при загрузке сайта или первого входа в личный кабинет. 

![запросы одобрений](/assets/new/chairman_startpages_1.png)


!!!note "На заметку"
    Для авторизованных пользователей, которые когда-либо ранее входили в личные кабинеты кооператива - система сохраняет крайний использованный пайщиком рабочий стол. Именно на этот рабочий стол пользователь попадет, если закроет и откроет сайт вновь. 

## Разработчикам

{{ dev_schema_source() }}

### Настройки системы

{{ get_sdk_doc("Mutations", "System", "UpdateSettings") }} | {{ get_graphql_doc("Mutation.updateSettings") }}

{{ get_typedoc_desc("Mutations.System.UpdateSettings") }}

{{ get_typedoc_input("Mutations.System.UpdateSettings") }}

Результат:

{{ get_typedoc_definition("Mutations.System.UpdateSettings", "IOutput") }}

### Рабочие столы (десктоп)

{{ get_sdk_doc("Queries", "Desktop", "GetDesktop") }} | {{ get_graphql_doc("query.getDesktop") }}

{{ get_typedoc_desc("Queries.Desktop.GetDesktop") }}

{{ get_typedoc_input("Queries.Desktop.GetDesktop") }}

Результат:

{{ get_typedoc_definition("Queries.Desktop.GetDesktop", "IOutput") }}

### Системная информация

{{ get_sdk_doc("Queries", "System", "GetSystemInfo") }} | {{ get_graphql_doc("query.getSystemInfo") }}

{{ get_typedoc_desc("Queries.System.GetSystemInfo") }}

{{ get_typedoc_input("Queries.System.GetSystemInfo") }}

Результат:

{{ get_typedoc_definition("Queries.System.GetSystemInfo", "IOutput") }}

