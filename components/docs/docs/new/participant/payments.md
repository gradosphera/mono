---
tags:
  - Пайщик
  - Разработчик
---

На странице платежей пайщика отображаются все входящие и исходящие платежи по [главному кошельку](wallet.md). Вступительный и минимальный паевой взносы, оплачиваеивые при регистрации пайщика, объединены в один тип платежа для внутреннего учета - регистрационный взнос. 

![платежи пайщика](/assets/new/participant_payments_1.png)

При создании заявления на возврат паевого взноса на листе платежей появляется запись со статусом "ожидает обработки". Статус записи изменится на "завершено", когда платеж будет фактически оплачен кассиром. В оплату кассиру платеж поступит после принятия решения советом. 

Дополнительную информацию по реквизитам, на которые будет произведена оплата кассиром, можно получить, развернув строку платежа:

![платежи пайщика](/assets/new/participant_payments_2.png)

## Разработчикам

{{ dev_schema_source() }}

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

### Создать платёж (депозит)

{{ get_sdk_doc("Mutations", "Gateway", "CreateDepositPayment") }} | {{ get_graphql_doc("Mutation.createDepositPayment") }}

{{ get_typedoc_desc("Mutations.Gateway.CreateDepositPayment") }}

{{ get_typedoc_input("Mutations.Gateway.CreateDepositPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.CreateDepositPayment", "IOutput") }}

### Создать начальный платёж

{{ get_sdk_doc("Mutations", "Gateway", "CreateInitialPayment") }} | {{ get_graphql_doc("Mutation.createInitialPayment") }}

{{ get_typedoc_desc("Mutations.Gateway.CreateInitialPayment") }}

{{ get_typedoc_input("Mutations.Gateway.CreateInitialPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.CreateInitialPayment", "IOutput") }}



