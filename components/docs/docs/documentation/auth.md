# Аутентификация

Система аутентификации платформы MONO основана на цифровых подписях EOSIO. Каждый пользователь владеет парой криптографических ключей — приватным и публичным. Приватный ключ используется для создания цифровой подписи, а публичный ключ позволяет проверить подлинность этой подписи. Аутентификация происходит путем подписания случайного вызова сервера приватным ключом пользователя.

В системе MONO используется двухтокенная схема аутентификации:
- **Access Token** — для доступа к API с коротким временем жизни
- **Refresh Token** — для обновления access token с длительным временем жизни

Это обеспечивает баланс между безопасностью и удобством использования.

## Вход в систему
{{ get_sdk_doc("Mutations", "Auth", "Login") }} | {{ get_graphql_doc("Mutation.login") }}

{{ get_typedoc_input("Mutations.Auth.Login") }}

Результат:

{{ get_typedoc_definition("Mutations.Auth.Login", "IOutput") }}

Процесс входа в систему:
1. Клиент отправляет имя пользователя
2. Сервер возвращает случайный challenge
3. Клиент подписывает challenge приватным ключом
4. Сервер проверяет подпись и выдает токены

## Обновление токена
{{ get_sdk_doc("Mutations", "Auth", "Refresh") }} | {{ get_graphql_doc("Mutation.refresh") }}

{{ get_typedoc_input("Mutations.Auth.Refresh") }}

Результат:

{{ get_typedoc_definition("Mutations.Auth.Refresh", "IOutput") }}

Refresh token имеет более длительное время жизни и используется для получения новых access token без повторной аутентификации.

## Выход из системы
{{ get_sdk_doc("Mutations", "Auth", "Logout") }} | {{ get_graphql_doc("Mutation.logout") }}

{{ get_typedoc_input("Mutations.Auth.Logout") }}

Результат:

{{ get_typedoc_definition("Mutations.Auth.Logout", "IOutput") }}

При выходе из системы refresh token добавляется в черный список, что делает невозможным его дальнейшее использование.

## Роли и права доступа

Система поддерживает следующие роли:
- **chairman** — председатель совета (полные права)
- **member** — член совета (ограниченные права)
- **user** — обычный пользователь (минимальные права)

Права доступа проверяются для каждого GraphQL запроса с помощью декораторов `@AuthRoles`.

## Безопасность

- Все токены имеют ограниченное время жизни
- Используется криптография уровня блокчейна EOSIO
- Поддерживается черный список refresh token
- Процесс восстановления ключей защищен email-верификацией (см. раздел "Аккаунты")
