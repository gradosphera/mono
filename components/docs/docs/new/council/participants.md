---
tags:
  - Член совета
  - Председатель
  - Разработчик
---

"Реестр пайщиков" стола совета содержит список пайщиков кооператива, их статус участия, персональные и контактные данные с возможностью редактирования, а также возможность добавления пайщиков. 

![модуль голосования](/assets/new/soviet_participants_1.png)

Краткую информацию о каждом пайщике на листе можно развернуть, нажав на зеленую кнопку со стрелочкой у левого края строки. На развороте будут представлены персональные данные пайщика с возможностью редактирования. Для сохранения отредактированных данных необходимо нажать на кнопку "Сохранить".

![модуль голосования](/assets/new/soviet_participants_2.png)

!!!note "Сохранение данных для глубокой сверки"
    Данные сохраняются в [Фабрике документов](../factory/index.md) для использования в производстве документов с учетом текущего номера блока без удаления предыдущей версии. Таким образом, у кооператива в базе данных хранится вся история изменений данных пайщиков, что позволяет использовать их для глубокой сверки документов в любой момент. Система будет автоматически выбирать данные пайщика до или после редактирования, подставляя их в документы на основе номера блока в цепочке [блокчейна](../blockchain/index.md).
  
В развернутой информации о пайщике есть дополнительная вкладка "Документы", которая позволяет просмотреть все документы с конкретным пайщиком. Нажав на стрелку рядом с документом, можно развернуть его для глубокой сверки, верификации подписи или скачивания. 

![модуль голосования](/assets/new/soviet_participants_3.png)

## Добавление пайщика

Добавление пайщика - это возможность внести **действующего** пайщика в реестр, пригласив его получить цифровую подпись. Эта возможность используется, когда необходимо добавить уже ранее принятого пайщика вне цифровой системы. 

![модуль голосования](/assets/new/soviet_participants_5.png)

!!!danger "Пайщик уже должен быть пайщиком!"
    Мы **добавляем** активного пайщика в цифровую систему. Это означает, что пайщик на момент добавления уже должен быть юридически принят в кооператив (например, по бумажному заявлению и протоколу решения совета). При добавлении пайщик не подписывает заявление на вступление, т.к. он его уже подписал где-то ранее. Система же позволяет его пригласить в цифровой кооператив простым добавлением. 
    
Для того, чтобы добавить пайщика, необходимо ввести его email и указать тип аккаунта. После указания типа аккаунта будет показана форма данных, аналогичная регистрационной, но с некоторыми дополнительными полями:

![модуль голосования](/assets/new/soviet_participants_6.png)

Помимо стандартных полей, как при вступлении пайщика, необходимо указать дату и время подписания заявления, а также суммы вступительного и минимального паевого взносов, которые были фактически уплачены. Суммы взносов автоматически устанавливаются на те, которые используются кооперативом при приеме пайщиков в электронном виде. Однако, поскольку ранее суммы могли отличаться, система заполняет их автоматически на основе типа аккаунта, но допускает изменения. 

Также, система предложит указать, добавлять ли сумму вступительного взноса в кошелек вступительных взносов кооператива. После добавления, сумма вступительного может быть использована (списана) в счёт расходов по фонду хозяйственной деятельности. Система делает предложение выбрать, т.к. средства по вступительному взносу данного пайщика уже могли быть учтены ранее в бухгалтерии и потрачены. Что же касается мининимального паевого взноса, то его сумма будет добавлена в главный кошелёк пайщика и паевой кошелек кооператива без исключений.

После нажатия на кнопку "Добавить", пайщик получит приглашение на электронную почту с предложением выпустить электронную подпись и подключиться к цифровому кооперативу по ссылке.  

## Разработчикам

{{ dev_schema_source() }}

### Кандидаты на вступление (`candidates`)

{{ get_graphql_doc("query.candidates") }}

Селектор запроса и типы входа — в `src/queries/registration/getCandidates.ts` (модуль `Queries.Registration` в рантайме SDK). В сгенерированной документации TypeDoc этот запрос может не иметь отдельной страницы модуля — ориентируйтесь на поле `candidates` в GraphQL и типы `CandidateFilterInput`, `PaginationInput`.

### Поиск по приватным данным аккаунтов

{{ get_sdk_doc("Queries", "Accounts", "SearchPrivateAccounts") }} | {{ get_graphql_doc("query.searchPrivateAccounts") }}

{{ get_typedoc_desc("Queries.Accounts.SearchPrivateAccounts") }}

{{ get_typedoc_input("Queries.Accounts.SearchPrivateAccounts") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.SearchPrivateAccounts", "IOutput") }}

### Список аккаунтов

{{ get_sdk_doc("Queries", "Accounts", "GetAccounts") }} | {{ get_graphql_doc("query.getAccounts") }}

{{ get_typedoc_desc("Queries.Accounts.GetAccounts") }}

{{ get_typedoc_input("Queries.Accounts.GetAccounts") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.GetAccounts", "IOutput") }}

### Добавить пайщика

{{ get_sdk_doc("Mutations", "Participants", "AddParticipant") }} | {{ get_graphql_doc("Mutation.addParticipant") }}

{{ get_typedoc_desc("Mutations.Participants.AddParticipant") }}

{{ get_typedoc_input("Mutations.Participants.AddParticipant") }}

Результат:

{{ get_typedoc_definition("Mutations.Participants.AddParticipant", "IOutput") }}

### Обновить аккаунт

{{ get_sdk_doc("Mutations", "Accounts", "UpdateAccount") }} | {{ get_graphql_doc("Mutation.updateAccount") }}

{{ get_typedoc_desc("Mutations.Accounts.UpdateAccount") }}

{{ get_typedoc_input("Mutations.Accounts.UpdateAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Accounts.UpdateAccount", "IOutput") }}

### Заявление на вступление (генерация)

{{ get_sdk_doc("Mutations", "Participants", "GenerateParticipantApplication") }} | {{ get_graphql_doc("Mutation.generateParticipantApplication") }}

{{ get_typedoc_desc("Mutations.Participants.GenerateParticipantApplication") }}

{{ get_typedoc_input("Mutations.Participants.GenerateParticipantApplication") }}

Результат:

{{ get_typedoc_definition("Mutations.Participants.GenerateParticipantApplication", "IOutput") }}

### Начальный платёж (в контексте регистрации пайщика)

{{ get_sdk_doc("Mutations", "Participants", "CreateInitialPayment") }} | {{ get_graphql_doc("Mutation.createInitialPayment") }}

{{ get_typedoc_desc("Mutations.Participants.CreateInitialPayment") }}

{{ get_typedoc_input("Mutations.Participants.CreateInitialPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Participants.CreateInitialPayment", "IOutput") }}


