---
tags:
  - Пайщик
  - Разработчик
---

Паевой взнос на странице "Кошелек" стола пайщика пополняет лицевой счет пайщика и делает его доступным для использования в любом приложении цифрового кооператива. 

Для совершения паевого взноса необходимо нажать кнопку «совершить взнос», которая покажет форму для указания суммы:

![ввести сумму пополнения](/assets/new/participant_wallet_3.png)

После указания суммы система сформирует платежное поручение, используя главного платёжного провайдера кооператива (по умолчанию — это QR-код для оплаты банковским переводом на расчетный счет кооператива).

![пополнить кошелек](/assets/new/participant_wallet_4.png)

После совершения оплаты, и после того, как кассир подтвердит получение платежа, произойдет зачисление суммы на лицевой счет главного кошелька. Сразу после этого он готов к использованию в приложениях. 

## Разработчикам

{{ dev_schema_source() }}

### Создать платёж (депозит / пополнение)

{{ get_sdk_doc("Mutations", "Gateway", "CreateDepositPayment") }} | {{ get_graphql_doc("Mutation.createDepositPayment") }}

{{ get_typedoc_desc("Mutations.Gateway.CreateDepositPayment") }}

{{ get_typedoc_input("Mutations.Gateway.CreateDepositPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.CreateDepositPayment", "IOutput") }}

### Изменить статус платежа

{{ get_sdk_doc("Mutations", "Gateway", "SetPaymentStatus") }} | {{ get_graphql_doc("Mutation.setPaymentStatus") }}

{{ get_typedoc_desc("Mutations.Gateway.SetPaymentStatus") }}

{{ get_typedoc_input("Mutations.Gateway.SetPaymentStatus") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.SetPaymentStatus", "IOutput") }}

### Список платежей

{{ get_sdk_doc("Queries", "Gateway", "GetPayments") }} | {{ get_graphql_doc("query.getPayments") }}

{{ get_typedoc_desc("Queries.Gateway.GetPayments") }}

{{ get_typedoc_input("Queries.Gateway.GetPayments") }}

Результат:

{{ get_typedoc_definition("Queries.Gateway.GetPayments", "IOutput") }}

### Баланс программного кошелька

{{ get_sdk_doc("Queries", "Wallet", "GetProgramWallet") }} | {{ get_graphql_doc("query.getProgramWallet") }}

{{ get_typedoc_desc("Queries.Wallet.GetProgramWallet") }}

{{ get_typedoc_input("Queries.Wallet.GetProgramWallet") }}

Результат:

{{ get_typedoc_definition("Queries.Wallet.GetProgramWallet", "IOutput") }}

