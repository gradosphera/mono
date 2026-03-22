---
tags:
  - Пайщик
  - Разработчик
---

Удостоверение пайщика предоставляет информацию об аккаунте пайщика, его публичном ключа, по которому производится сверка подписи на электронных документах, а также, личные данные пайщика, которые используются при производстве документов. 

!!!warn "Как изменить данные"
    Для внесения изменений в данные удостоверения необходимо обратиться в кооператив через "Контакты". 
    
![пополнить кошелек](/assets/new/participant_identity_1.png)

## Разработчикам

{{ dev_schema_source() }}

### Данные аккаунта

{{ get_sdk_doc("Queries", "Accounts", "GetAccount") }} | {{ get_graphql_doc("query.getAccount") }}

{{ get_typedoc_desc("Queries.Accounts.GetAccount") }}

{{ get_typedoc_input("Queries.Accounts.GetAccount") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.GetAccount", "IOutput") }}

### Обновление аккаунта (в т.ч. председателем)

{{ get_sdk_doc("Mutations", "Accounts", "UpdateAccount") }} | {{ get_graphql_doc("Mutation.updateAccount") }}

{{ get_typedoc_desc("Mutations.Accounts.UpdateAccount") }}

{{ get_typedoc_input("Mutations.Accounts.UpdateAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.UpdateAccount", "IOutput") }}



