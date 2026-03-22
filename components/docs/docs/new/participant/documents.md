---
tags:
  - Пайщик
  - Разработчик
---

Страница "Документы" предоставляет пайщику список пакетов документов с его участием. Пакеты документов содержат в себе заявления, протоколы решений и сопутствующие документы, если таковые имеются (например, акты приема-передачи, и т.д.). Каждый пакет документов может быть развернут для чтения содержимого и просмотра состояния цифровой подписи на каждом отдельном документе.

![документы пайщика](/assets/new/participant_documents_1.png)

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

Класс для подписи содержимого документов: {{ get_class_doc("Classes", "Document") }}.



 