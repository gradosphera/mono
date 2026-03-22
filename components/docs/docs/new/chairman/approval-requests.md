---
tags:
  - Председатель
  - Разработчик
---

На странице запросов одобрений представлены входящие документы, которые должны быть завизированы подписью председателя как принятые. 

![запросы одобрений](/assets/new/chairman_approvals_1.png)

Запросы одобрений являются частью бизнес-процессов, по ходу которых они запрашиваются. Как только одобрение председателя будет получено - процесс продолжит выполняться по стандартам смарт-контрактов. 

Страница запросов одобрений стола председателя - это центральная точка, в которую сводятся все запросы одобрений всех смарт-контрактов всех бизнес-процессов цифрового кооператива. 

!!!info "О нагрузках"
    В больших кооперативах запросы одобрений могут вызывать задержки и создавать большую нагрузку на председателя совета. Для решения этого, председатель сможет делегировать полномочия одобрений пайщикам или роботу. На текущий момент возможность делегирования не реализована. 

## Разработчикам

{{ dev_schema_source() }}

### Список запросов на одобрение

{{ get_sdk_doc("Queries", "Chairman", "GetApprovals") }} | {{ get_graphql_doc("query.chairmanApprovals") }}

{{ get_typedoc_desc("Queries.Chairman.GetApprovals") }}

{{ get_typedoc_input("Queries.Chairman.GetApprovals") }}

Результат:

{{ get_typedoc_definition("Queries.Chairman.GetApprovals", "IOutput") }}

### Один запрос на одобрение

{{ get_sdk_doc("Queries", "Chairman", "GetApproval") }} | {{ get_graphql_doc("query.chairmanApproval") }}

{{ get_typedoc_desc("Queries.Chairman.GetApproval") }}

{{ get_typedoc_input("Queries.Chairman.GetApproval") }}

Результат:

{{ get_typedoc_definition("Queries.Chairman.GetApproval", "IOutput") }}

### Подтвердить одобрение

{{ get_sdk_doc("Mutations", "Chairman", "ConfirmApprove") }} | {{ get_graphql_doc("Mutation.chairmanConfirmApprove") }}

{{ get_typedoc_desc("Mutations.Chairman.ConfirmApprove") }}

{{ get_typedoc_input("Mutations.Chairman.ConfirmApprove") }}

Результат:

{{ get_typedoc_definition("Mutations.Chairman.ConfirmApprove", "IOutput") }}

### Отклонить одобрение

{{ get_sdk_doc("Mutations", "Chairman", "DeclineApprove") }} | {{ get_graphql_doc("Mutation.chairmanDeclineApprove") }}

{{ get_typedoc_desc("Mutations.Chairman.DeclineApprove") }}

{{ get_typedoc_input("Mutations.Chairman.DeclineApprove") }}

Результат:

{{ get_typedoc_definition("Mutations.Chairman.DeclineApprove", "IOutput") }}

{{ dev_blockchain_note() }}


