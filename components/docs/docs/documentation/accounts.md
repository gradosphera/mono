# Аккаунты

Аккаунты в системе MONO представляют собой многоуровневую структуру, которая связывает пользователей платформы с блокчейном-системой COOPOS. Каждый аккаунт содержит информацию о пользователе в различных контекстах: как участника блокчейна, как пользователя платформы MONO, и как потенциального или действующего пайщика кооператива.

## Структура аккаунта

Аккаунт в MONO состоит из нескольких компонентов:

- **Blockchain Account** — системная информация блокчейна (публичные ключи, ресурсы)
- **MONO Account** — данные в системе MONO (email, настройки)
- **User Account** — базовая информация пользователя
- **Participant Account** — информация о статусе пайщика
- **Private Account** — персональные данные (ФИО, документы)

## Получить информацию об аккаунте
{{ get_sdk_doc("Queries", "Accounts", "GetAccount") }} | {{ get_graphql_doc("Query.getAccount") }}

{{ get_typedoc_input("Queries.Accounts.GetAccount") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.GetAccount", "IOutput") }}

## Получить список аккаунтов
{{ get_sdk_doc("Queries", "Accounts", "GetAccounts") }} | {{ get_graphql_doc("Query.getAccounts") }}

{{ get_typedoc_input("Queries.Accounts.GetAccounts") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.GetAccounts", "IOutput") }}

## Поиск по приватным данным
{{ get_sdk_doc("Queries", "Accounts", "SearchPrivateAccounts") }} | {{ get_graphql_doc("Query.searchPrivateAccounts") }}

{{ get_typedoc_input("Queries.Accounts.SearchPrivateAccounts") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.SearchPrivateAccounts", "IOutput") }}

Поиск осуществляется по полям ФИО, ИНН, ОГРН, наименованию организации и другим приватным данным.

## Зарегистрировать аккаунт
{{ get_sdk_doc("Mutations", "Accounts", "RegisterAccount") }} | {{ get_graphql_doc("Mutation.registerAccount") }}

{{ get_typedoc_input("Mutations.Accounts.RegisterAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.RegisterAccount", "IOutput") }}

Регистрация нового аккаунта пользователя в системе MONO. При регистрации создается аккаунт в блокчейне и связанная запись в базе данных MONO.

## Обновить аккаунт
{{ get_sdk_doc("Mutations", "Accounts", "UpdateAccount") }} | {{ get_graphql_doc("Mutation.updateAccount") }}

{{ get_typedoc_input("Mutations.Accounts.UpdateAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.UpdateAccount", "IOutput") }}

Обновление аккаунта пользователя производится по username. Мутация позволяет изменить приватные данные пользователя, а также адрес электронной почты в MONO. Использовать мутацию может только председатель совета.

## Восстановление доступа

### Начать восстановление приватного ключа
{{ get_sdk_doc("Mutations", "Accounts", "StartResetKey") }} | {{ get_graphql_doc("Mutation.startResetKey") }}

{{ get_typedoc_input("Mutations.Accounts.StartResetKey") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.StartResetKey", "IOutput") }}

Инициация процедуры восстановления доступа к аккаунту при утере приватного ключа. Метод отправляет секретную фразу на указанную электронную почту для подтверждения права на восстановление.

### Заменить приватный ключ
{{ get_sdk_doc("Mutations", "Accounts", "ResetKey") }} | {{ get_graphql_doc("Mutation.resetKey") }}

{{ get_typedoc_input("Mutations.Accounts.ResetKey") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.ResetKey", "IOutput") }}

Финальный этап восстановления доступа. Пользователь предоставляет новый публичный ключ и токен, полученный по email. После успешной замены старый приватный ключ становится недействительным.

!!!warning "Безопасность"
    Процедура восстановления ключа требует подтверждения от члена совета кооператива. Восстановление доступа возможно только для зарегистрированных пайщиков с подтвержденной электронной почтой.

## Типы аккаунтов

Система поддерживает три типа аккаунтов:

- **individual** — физическое лицо
- **entrepreneur** — индивидуальный предприниматель  
- **organization** — юридическое лицо

Каждый тип имеет специфичные поля данных и требования к документам.

## Жизненный цикл аккаунта

1. **Регистрация** — создание аккаунта в блокчейне и MONO
2. **Верификация** — подтверждение email и данных
3. **Активация** — получение статуса пайщика (опционально)
4. **Использование** — работа с системой кооператива
5. **Деактивация** — приостановка доступа (опционально)





