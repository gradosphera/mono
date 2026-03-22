---
tags:
  - Пайщик
  - Разработчик
---

Реквизиты пайщика используются для совершения платежей при возврате паевых взносов. 

![пополнить кошелек](/assets/new/participant_requisites_1.png)

Для добавления реквизитов необходимо нажать на кнопку "Добавить" в шапке страницы, что откроет всплывающее окно с выбором типа реквизитов. На текущий момент доступны два типа: Система Быстрых Платежей (СБП) и Банковский Перевод. После выборе типа реквизитов, вводе данных и добавлении, реквизиты становятся доступными для получения платежей на них. 

![пополнить кошелек](/assets/new/participant_requisites_3.png)

## Разработчикам

{{ dev_schema_source() }}

### Список платёжных методов

{{ get_sdk_doc("Queries", "PaymentMethods", "GetPaymentMethods") }} | {{ get_graphql_doc("query.getPaymentMethods") }}

{{ get_typedoc_desc("Queries.PaymentMethods.GetPaymentMethods") }}

{{ get_typedoc_input("Queries.PaymentMethods.GetPaymentMethods") }}

Результат:

{{ get_typedoc_definition("Queries.PaymentMethods.GetPaymentMethods", "IOutput") }}

### Добавить реквизиты

{{ get_sdk_doc("Mutations", "PaymentMethods", "AddPaymentMethod") }} | {{ get_graphql_doc("Mutation.addPaymentMethod") }}

{{ get_typedoc_desc("Mutations.PaymentMethods.AddPaymentMethod") }}

{{ get_typedoc_input("Mutations.PaymentMethods.AddPaymentMethod") }}

Результат:

{{ get_typedoc_definition("Mutations.PaymentMethods.AddPaymentMethod", "IOutput") }}

### Обновить банковский счёт

{{ get_sdk_doc("Mutations", "PaymentMethods", "UpdateBankAccount") }} | {{ get_graphql_doc("Mutation.updateBankAccount") }}

{{ get_typedoc_desc("Mutations.PaymentMethods.UpdateBankAccount") }}

{{ get_typedoc_input("Mutations.PaymentMethods.UpdateBankAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.PaymentMethods.UpdateBankAccount", "IOutput") }}

### Удалить платёжный метод

{{ get_sdk_doc("Mutations", "PaymentMethods", "DeletePaymentMethod") }} | {{ get_graphql_doc("Mutation.deletePaymentMethod") }}

{{ get_typedoc_desc("Mutations.PaymentMethods.DeletePaymentMethod") }}

{{ get_typedoc_input("Mutations.PaymentMethods.DeletePaymentMethod") }}

Результат:

{{ get_typedoc_definition("Mutations.PaymentMethods.DeletePaymentMethod", "IOutput") }}


