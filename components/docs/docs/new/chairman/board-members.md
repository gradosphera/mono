---
tags:
  - Председатель
  - Разработчик
---

Страница управления составом совета кооператива позволяет председателю просматривать и редактировать список членов совета. 

![члены совета](/assets/new/chairman_members_1.png)


!!!danger "ВАЖНО!"
    Состав членов совета должен быть утвержден общим собранием пайщиков. 
    
    
Для добавления члена совета необходимо указать ФИО пайщика и выбрать его из списка:

![члены совета](/assets/new/chairman_members_2.png)

!!!note "На заметку"
    В дальнейшем мы планируем ввести специализированный вопрос на повестке общего собрания пайщиков, который будет автоматически изменять состав членов совета. Однако, ручное управление составом мы, вероятно, сохраним, на случай, если решение об изменении принято за пределами цифровой системы. 

## Разработчикам

{{ dev_schema_source() }}

### Системная информация (в т.ч. состав совета)

{{ get_sdk_doc("Queries", "System", "GetSystemInfo") }} | {{ get_graphql_doc("query.getSystemInfo") }}

{{ get_typedoc_desc("Queries.System.GetSystemInfo") }}

{{ get_typedoc_input("Queries.System.GetSystemInfo") }}

Результат:

{{ get_typedoc_definition("Queries.System.GetSystemInfo", "IOutput") }}

В ответе поле `board_members` (тип `BoardMember`) отражает текущий состав совета, отображаемый в интерфейсе.

### Изменение состава совета (как в UI рабочего стола)

Транзакция в контракт `soviet`, действие `updateboard`; типы параметров — `cooptypes` → `SovietContract.Actions.Boards.UpdateBoard` (см. также `src/features/Cooperative/UpdateBoard` на десктопе).

{{ dev_blockchain_note() }}

