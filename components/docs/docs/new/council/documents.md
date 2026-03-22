---
tags:
  - Член совета
  - Председатель
  - Разработчик
---

В разделе "Реестр документов" представлены все пакеты документов, которые приняты советом. Страница позволяет открывать карточку пакета документа, просматривать входящие в пакет документы и решения, валидировать их цифровые подписи и производить глубокие сверки.

!!!info "Пакет документов"
    Пакет документов - это документы, которые объединены одним бизнес-процессом. Например, вступление пайщика в кооператив (заявление - протокол решения) или паевой взнос имуществом (заявление - протокол решения - акт приёма-передачи). Пакеты документов объединяют заявления, протоколы решений, акты приема-передачи и прочие документы, которые могут быть помещены к пакету по признаку бизнес-процесса. Именно пакеты документов используются в расчетах использования вычислительных ресурсов на странице [Монитор ресурсов](../resources/monitor.md)


![реестр документов](/assets/new/soviet_documents_1.png)

При нажатии на зеленую стрелку у левого края строки пакета, будет произведен разворот документов пакета. Каждый документ можно скачать, верифицировать его подпись и каждому документу произвести [глубокую сверку](../factory/index.md). 

![реестр документов](/assets/new/soviet_documents_2.png)

## Разработчикам

{{ dev_schema_source() }}

### Список документов

{{ get_sdk_doc("Queries", "Documents", "GetDocuments") }} | {{ get_graphql_doc("query.getDocuments") }}

{{ get_typedoc_desc("Queries.Documents.GetDocuments") }}

{{ get_typedoc_input("Queries.Documents.GetDocuments") }}

Результат:

{{ get_typedoc_definition("Queries.Documents.GetDocuments", "IOutput") }}

### Поиск документов

{{ get_sdk_doc("Queries", "Search", "SearchDocuments") }} | {{ get_graphql_doc("query.searchDocuments") }}

{{ get_typedoc_desc("Queries.Search.SearchDocuments") }}

{{ get_typedoc_input("Queries.Search.SearchDocuments") }}

Результат:

{{ get_typedoc_definition("Queries.Search.SearchDocuments", "IOutput") }}



