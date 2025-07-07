# Кошелёк

Кошелёк в системе MONO представляет собой модуль для управления паевыми взносами и финансовыми операциями пайщиков кооператива. Все операции проходят через платёжный шлюз и отражаются в блокчейне для обеспечения прозрачности и неизменности записей.

## Паевые взносы

Паевые взносы являются основой членства в кооперативе. Система поддерживает различные типы взносов и операций с ними.

### Создать депозитный платеж
{{ get_sdk_doc("Mutations", "Wallet", "CreateDepositPayment") }} | {{ get_graphql_doc("Mutation.createDepositPayment") }}

{{ get_typedoc_input("Mutations.Wallet.CreateDepositPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.CreateDepositPayment", "IOutput") }}

Создание объекта паевого платежа производится мутацией createDepositPayment. Выполнение мутации возвращает идентификатор платежа и данные для его совершения в зависимости от выбранного платежного провайдера.

### Создать заявку на вывод средств
{{ get_sdk_doc("Mutations", "Wallet", "CreateWithdraw") }} | {{ get_graphql_doc("Mutation.createWithdraw") }}

{{ get_typedoc_input("Mutations.Wallet.CreateWithdraw") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.CreateWithdraw", "IOutput") }}

Создание заявки на вывод паевых средств из кооператива. Заявка проходит процедуру рассмотрения советом.

## Возврат паевых взносов

Система предоставляет полный документооборот для возврата паевых взносов при выходе из кооператива.

### Заявление на возврат
{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyStatementDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyStatementDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyStatementDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyStatementDocument", "IOutput") }}

Генерация документа заявления на возврат паевого взноса. Документ подписывается пайщиком и подается в совет для рассмотрения.

### Решение о возврате
{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyDecisionDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyDecisionDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument", "IOutput") }}

Генерация документа решения совета о возврате паевого взноса. Документ оформляется после рассмотрения заявления и принятия положительного решения.

## Процедура возврата паевых взносов

1. **Подача заявления** - пайщик генерирует и подписывает заявление на возврат
2. **Рассмотрение советом** - совет рассматривает заявление на собрании
3. **Принятие решения** - совет генерирует решение о возврате
4. **Выполнение возврата** - технический возврат средств через платёжную систему

## Безопасность операций

- Все финансовые операции требуют цифровой подписи
- Операции отражаются в неизменяемом блокчейне
- Многоступенчатая система подтверждений
- Аудит всех движений средств

## Интеграция с платёжными системами

Кошелёк интегрирован с различными платёжными провайдерами для удобства пайщиков:

- Банковские карты
- Банковские переводы  
- Электронные кошельки
- Криптовалютные платежи (в планах)

