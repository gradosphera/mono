---
tags:
  - Пайщик
  - Разработчик
---

Возврат паевого взноса инициируется заявлением пайщика из интерфейса страницы кошелька нажатием на кнопку "Получить возврат". Для получения возврата, предварительно необходимо добавить реквизиты, на которые будет производится платеж на странице [Реквизиты](requisites.md).

После нажатия на кнопку "Получить возврат" появится меню ввода суммы и выбора реквизитов для получения из списка доступных. При создании заявления средства перейдут в статус «заблокировано» на главном кошельке на время обработки кассиром. После оплаты исходящего платежа кассиром, средства будут фактически списаны с кошелька. 

![возврат паевого взноса](/assets/new/participant_wallet_5.png)

Для наблюдения за состоянием обработки возврата паевого взноса см. страницу [Платежи](payments.md). Для просмотра заявления на возврат паевого взноса см. страницу [Документы](documents.md) cтола пайщика. 

## Разработчикам

{{ dev_schema_source() }}

### Заявление на возврат (генерация документа)

{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyStatementDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyStatementDocument") }}

{{ get_typedoc_desc("Mutations.Wallet.GenerateReturnByMoneyStatementDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyStatementDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyStatementDocument", "IOutput") }}

### Решение по возврату (генерация документа)

{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyDecisionDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyDecisionDocument") }}

{{ get_typedoc_desc("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument", "IOutput") }}

### Список платежей

{{ get_sdk_doc("Queries", "Gateway", "GetPayments") }} | {{ get_graphql_doc("query.getPayments") }}

{{ get_typedoc_desc("Queries.Gateway.GetPayments") }}

{{ get_typedoc_input("Queries.Gateway.GetPayments") }}

Результат:

{{ get_typedoc_definition("Queries.Gateway.GetPayments", "IOutput") }}

### Изменить статус платежа

{{ get_sdk_doc("Mutations", "Gateway", "SetPaymentStatus") }} | {{ get_graphql_doc("Mutation.setPaymentStatus") }}

{{ get_typedoc_desc("Mutations.Gateway.SetPaymentStatus") }}

{{ get_typedoc_input("Mutations.Gateway.SetPaymentStatus") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.SetPaymentStatus", "IOutput") }}

### Баланс программного кошелька

{{ get_sdk_doc("Queries", "Wallet", "GetProgramWallet") }} | {{ get_graphql_doc("query.getProgramWallet") }}

{{ get_typedoc_desc("Queries.Wallet.GetProgramWallet") }}

{{ get_typedoc_input("Queries.Wallet.GetProgramWallet") }}

Результат:

{{ get_typedoc_definition("Queries.Wallet.GetProgramWallet", "IOutput") }}



