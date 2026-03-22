---
tags:
  - Председатель
  - Разработчик
---

Страница предоставляет возможность председателю изменить публичные контакты кооператива, которые указываются в "подвале" сайта для не авторизованных пайщиков, и на странице [Контакты](../participant/contacts.md) стола авторизованного пайщика.

![управление контактами](/assets/new/chairman_contacts_1.png)

## Разработчикам

{{ dev_schema_source() }}

### Системная информация (в т.ч. публичные контакты)

{{ get_sdk_doc("Queries", "System", "GetSystemInfo") }} | {{ get_graphql_doc("query.getSystemInfo") }}

{{ get_typedoc_desc("Queries.System.GetSystemInfo") }}

{{ get_typedoc_input("Queries.System.GetSystemInfo") }}

Результат:

{{ get_typedoc_definition("Queries.System.GetSystemInfo", "IOutput") }}

В ответе поле `contacts` (`ContactsDTO`: телефон, email и др.) соответствует блоку контактов в подвале сайта и на странице «Контакты» у пайщика.

### Запись контактов (как в UI председателя)

Отдельной GraphQL-мутации «только контакты кооператива» нет. Действие `updateaccnt` контракта `registrator` с `meta` в виде JSON (`RegistratorContract.Actions.UpdateAccount`, поля `phone` и `email` в `Cooperative.Users.IAccountMeta`; см. `src/features/User/UpdateMeta` на десктопе).

{{ dev_blockchain_note() }}


