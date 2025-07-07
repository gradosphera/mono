# Кооперативные участки

Кооперативные участки — это организационная структура крупных кооперативов для эффективного управления и представительства интересов пайщиков в различных регионах или сферах деятельности.

## Получить список участков
{{ get_sdk_doc("Queries", "Branches", "GetBranches") }} | {{ get_graphql_doc("Query.getBranches") }}

{{ get_typedoc_input("Queries.Branches.GetBranches") }}

Результат:

{{ get_typedoc_definition("Queries.Branches.GetBranches", "IOutput") }}

## Создать участок
{{ get_sdk_doc("Mutations", "Branches", "CreateBranch") }} | {{ get_graphql_doc("Mutation.createBranch") }}

{{ get_typedoc_input("Mutations.Branches.CreateBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.CreateBranch", "IOutput") }}

Создание нового кооперативного участка с назначением уполномоченного лица.

## Изменить участок
{{ get_sdk_doc("Mutations", "Branches", "EditBranch") }} | {{ get_graphql_doc("Mutation.editBranch") }}

{{ get_typedoc_input("Mutations.Branches.EditBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.EditBranch", "IOutput") }}

Редактирование информации о кооперативном участке.

## Удалить участок
{{ get_sdk_doc("Mutations", "Branches", "DeleteBranch") }} | {{ get_graphql_doc("Mutation.deleteBranch") }}

{{ get_typedoc_input("Mutations.Branches.DeleteBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.DeleteBranch", "IOutput") }}

Удаление кооперативного участка из системы.

## Управление доверенными лицами

### Добавить доверенное лицо
{{ get_sdk_doc("Mutations", "Branches", "AddTrustedAccount") }} | {{ get_graphql_doc("Mutation.addTrustedAccount") }}

{{ get_typedoc_input("Mutations.Branches.AddTrustedAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.AddTrustedAccount", "IOutput") }}

Добавление доверенного лица для кооперативного участка.

### Удалить доверенное лицо
{{ get_sdk_doc("Mutations", "Branches", "DeleteTrustedAccount") }} | {{ get_graphql_doc("Mutation.deleteTrustedAccount") }}

{{ get_typedoc_input("Mutations.Branches.DeleteTrustedAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.DeleteTrustedAccount", "IOutput") }}

Удаление доверенного лица кооперативного участка.

## Выбор участка пайщиком

### Выбрать участок
{{ get_sdk_doc("Mutations", "Branches", "SelectBranch") }} | {{ get_graphql_doc("Mutation.selectBranch") }}

{{ get_typedoc_input("Mutations.Branches.SelectBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.SelectBranch", "IOutput") }}

Выбор кооперативного участка пайщиком для делегирования голоса.

### Сгенерировать документ выбора
{{ get_sdk_doc("Mutations", "Branches", "GenerateSelectBranchDocument") }} | {{ get_graphql_doc("Mutation.generateSelectBranchDocument") }}

{{ get_typedoc_input("Mutations.Branches.GenerateSelectBranchDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.GenerateSelectBranchDocument", "IOutput") }}

Генерация документа, подтверждающего выбор кооперативного участка.

## Мажоритарная система

В мажоритарной системе управления (≥3 участков) пайщики делегируют свои голоса уполномоченным лицам участков, которые представляют их интересы на общих собраниях кооператива.

## Процедуры участков

1. **Создание** — создание участка с назначением уполномоченного
2. **Настройка** — добавление доверенных лиц и настройка параметров
3. **Регистрация пайщиков** — привязка пайщиков к участку
4. **Представительство** — участие в управлении кооперативом 


