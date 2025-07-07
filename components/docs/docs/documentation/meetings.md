# Общие собрания

Общие собрания пайщиков являются высшим органом управления кооперативом. Система MONO обеспечивает полный цифровой документооборот для проведения общих собраний, включая уведомления, голосование и оформление решений.

## Получить информацию о собрании
{{ get_sdk_doc("Queries", "Meet", "GetMeet") }} | {{ get_graphql_doc("Query.getMeet") }}

{{ get_typedoc_input("Queries.Meet.GetMeet") }}

Результат:

{{ get_typedoc_definition("Queries.Meet.GetMeet", "IOutput") }}

## Получить список собраний
{{ get_sdk_doc("Queries", "Meet", "GetMeets") }} | {{ get_graphql_doc("Query.getMeets") }}

{{ get_typedoc_input("Queries.Meet.GetMeets") }}

Результат:

{{ get_typedoc_definition("Queries.Meet.GetMeets", "IOutput") }}

## Создание общего собрания
{{ get_sdk_doc("Mutations", "Meet", "CreateAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.createAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.CreateAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.CreateAnnualGeneralMeet", "IOutput") }}

Создание предложения повестки очередного общего собрания пайщиков.

## Уведомление о собрании
{{ get_sdk_doc("Mutations", "Meet", "NotifyOnAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.notifyOnAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.NotifyOnAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.NotifyOnAnnualGeneralMeet", "IOutput") }}

Отправка уведомлений всем пайщикам о проведении общего собрания.

## Голосование на собрании
{{ get_sdk_doc("Mutations", "Meet", "VoteOnAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.voteOnAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.VoteOnAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.VoteOnAnnualGeneralMeet", "IOutput") }}

Голосование пайщика по вопросам повестки общего собрания.

## Подписание секретарем
{{ get_sdk_doc("Mutations", "Meet", "SignBySecretaryOnAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.signBySecretaryOnAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.SignBySecretaryOnAnnualGeneralMeet", "IOutput") }}

Подписание решения секретарём на общем собрании пайщиков.

## Подписание председателем
{{ get_sdk_doc("Mutations", "Meet", "SignByPresiderOnAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.signByPresiderOnAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.SignByPresiderOnAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.SignByPresiderOnAnnualGeneralMeet", "IOutput") }}

Подписание решения председателем на общем собрании пайщиков.

## Перезапуск собрания
{{ get_sdk_doc("Mutations", "Meet", "RestartAnnualGeneralMeet") }} | {{ get_graphql_doc("Mutation.restartAnnualGeneralMeet") }}

{{ get_typedoc_input("Mutations.Meet.RestartAnnualGeneralMeet") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.RestartAnnualGeneralMeet", "IOutput") }}

Перезапуск общего собрания пайщиков при необходимости.

## Генерация документов

### Повестка собрания
{{ get_sdk_doc("Mutations", "Meet", "GenerateAnnualGeneralMeetAgendaDocument") }} | {{ get_graphql_doc("Mutation.generateAnnualGeneralMeetAgendaDocument") }}

{{ get_typedoc_input("Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument", "IOutput") }}

Генерация документа предложения повестки общего собрания пайщиков.

### Уведомление о собрании
{{ get_sdk_doc("Mutations", "Meet", "GenerateAnnualGeneralMeetNotificationDocument") }} | {{ get_graphql_doc("Mutation.generateAnnualGeneralMeetNotificationDocument") }}

{{ get_typedoc_input("Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.GenerateAnnualGeneralMeetNotificationDocument", "IOutput") }}

Генерация документа уведомления о проведении общего собрания.

### Бюллетень для голосования
{{ get_sdk_doc("Mutations", "Meet", "GenerateBallotForAnnualGeneralMeetDocument") }} | {{ get_graphql_doc("Mutation.generateBallotForAnnualGeneralMeetDocument") }}

{{ get_typedoc_input("Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument", "IOutput") }}

Генерация бюллетеня для голосования на общем собрании.

### Решение собрания
{{ get_sdk_doc("Mutations", "Meet", "GenerateAnnualGeneralMeetDecisionDocument") }} | {{ get_graphql_doc("Mutation.generateAnnualGeneralMeetDecisionDocument") }}

{{ get_typedoc_input("Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.GenerateAnnualGeneralMeetDecisionDocument", "IOutput") }}

Генерация документа решения общего собрания пайщиков.

### Решение совета о проведении собрания
{{ get_sdk_doc("Mutations", "Meet", "GenerateSovietDecisionOnAnnualMeetDocument") }} | {{ get_graphql_doc("Mutation.generateSovietDecisionOnAnnualMeetDocument") }}

{{ get_typedoc_input("Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument", "IOutput") }}

Генерация документа решения Совета о проведении общего собрания.

## Жизненный цикл общего собрания

1. **Инициация** - создание повестки собрания
2. **Решение совета** - принятие решения о проведении  
3. **Уведомление** - извещение всех пайщиков
4. **Проведение** - само собрание и голосование
5. **Оформление** - подписание решений секретарем и председателем
6. **Завершение** - публикация итоговых документов 