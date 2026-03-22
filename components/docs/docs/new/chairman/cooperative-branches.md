---
tags:
  - Председатель
  - Разработчик
---

Страница предоставляет список кооперативных участков с возможностью добавления, редактирования и удаления. Все изменения на этой странице должны иметь юридические основания - решения совета или собрания пайщиков. 

![члены совета](/assets/new/chairman_branches_1.png)

На текущий момент в системе еще не реализован стол уполномоченных кооперативных участков, на котором пайщики смогут согласно стандартам смарт-контрактов, самоорганизоваться в кооперативный участок и получить решение совета. Потому, на этой странице председатель совета только **добавляет** уже юридически-существующие кооперативные участки в цифровую систему. Полный путь организации кооперативного участка будет оцифрован позднее. 

Для добавления кооперативного участка необходимо нажать на кнопку "Добавить участок" в шапке страницы, после чего, откроется диалогое окно для ввода данных. Председатель кооперативного участка выбирается из списка пайщиков кооператива. Юридический адрес кооперативного участка будет соответствовать юридическому адресу кооператива. Фактический адрес - тот, который будет указан. 

![члены совета](/assets/new/chairman_branches_2.png)

Если нажать на зеленую стрелочку у левого края строки с наименованием кооперативного участка, то откроется вложение с карточкой кооперативного участка и возможностью редактирования:

![члены совета](/assets/new/chairman_branches_3.png)

По-умолчанию в качестве банковского счёта кооперативного участка автоматически указывается банковский счёт кооператива. Для замены - просто введите новые данные и сохраните их. Так, кооперативный участок может обладать собствнным расчетным счетом. 

![члены совета](/assets/new/chairman_branches_8.png)


Карточка председателя не редактируется т.к. она только отображает данные председателя кооперативного участка. Для редактирования данных председателя необходимо найти его на странице [реестр пайщиков](../council/participants.md) на столе совета. 

А вот данные по кооперативному участку можно легко отредактировать, в том числе, заменив председателя кооперативного участка (на что у председателя должно быть юридическое основание):

![члены совета](/assets/new/chairman_branches_7.png)

## Переход к двухуровневому управлению

Как только в цифровом кооперативе добавляется 3 кооперативных участка - он переходит на двухуровневую систему управления. С этого момента всем пайщикам будет предложено выбрать кооперативный участок и делегировать свой голос на общих собраниях его председателю. Общие собрания пайщиков трансформируются в общие собрания уполномоченных. 

Сразу после перехода все пайщики увидят сообщение об этом в личных кабинетах с предложением выбрать кооперативный участок:

![члены совета](/assets/new/chairman_branches_4.png)

Выбор кооперативного участка осуществляется списком с указанием их фактических адресов:

![члены совета](/assets/new/chairman_branches_5.png)

После выбора кооперативного участка пайщику будет автоматически сформировано заявление о выборе кооперативного участка и делегировании своего голоса на общих собраниях его председателю:

![члены совета](/assets/new/chairman_branches_6.png)

После подписи заявления пайщик закрепляется за кооперативным участком и может продолжать использовать платформу. 


!!!warning "Возврат к одноуровневой системе"
    Если кооперативных участков в списке останется меньше 3, то система вернется к одноуровневому режиму работы. Таким образом, чтобы вернуть систему в одноуровневый режим - председателю достаточно удалить кооперативные участки из списка.


**Важно!** С момента включения двухуровневой системы управления в [процесс вступления пайщиков](../registration/join.md) добавится пункт с предложением выбрать кооперативный участок. Запись о делегировании голоса на общих собраниях председателю выбранного кооперативного участка добавится в заявление на вступление в кооператив.

## Разработчикам

{{ dev_schema_source() }}

### Список кооперативных участков

{{ get_sdk_doc("Queries", "Branches", "GetBranches") }} | {{ get_graphql_doc("query.getBranches") }}

{{ get_typedoc_desc("Queries.Branches.GetBranches") }}

{{ get_typedoc_input("Queries.Branches.GetBranches") }}

Результат:

{{ get_typedoc_definition("Queries.Branches.GetBranches", "IOutput") }}

### Создать участок

{{ get_sdk_doc("Mutations", "Branches", "CreateBranch") }} | {{ get_graphql_doc("Mutation.createBranch") }}

{{ get_typedoc_desc("Mutations.Branches.CreateBranch") }}

{{ get_typedoc_input("Mutations.Branches.CreateBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.CreateBranch", "IOutput") }}

### Изменить участок

{{ get_sdk_doc("Mutations", "Branches", "EditBranch") }} | {{ get_graphql_doc("Mutation.editBranch") }}

{{ get_typedoc_desc("Mutations.Branches.EditBranch") }}

{{ get_typedoc_input("Mutations.Branches.EditBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.EditBranch", "IOutput") }}

### Удалить участок

{{ get_sdk_doc("Mutations", "Branches", "DeleteBranch") }} | {{ get_graphql_doc("Mutation.deleteBranch") }}

{{ get_typedoc_desc("Mutations.Branches.DeleteBranch") }}

{{ get_typedoc_input("Mutations.Branches.DeleteBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.DeleteBranch", "IOutput") }}

### Документ выбора участка пайщиком

{{ get_sdk_doc("Mutations", "Branches", "GenerateSelectBranchDocument") }} | {{ get_graphql_doc("Mutation.generateSelectBranchDocument") }}

{{ get_typedoc_desc("Mutations.Branches.GenerateSelectBranchDocument") }}

{{ get_typedoc_input("Mutations.Branches.GenerateSelectBranchDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.GenerateSelectBranchDocument", "IOutput") }}

### Выбор участка пайщиком

{{ get_sdk_doc("Mutations", "Branches", "SelectBranch") }} | {{ get_graphql_doc("Mutation.selectBranch") }}

{{ get_typedoc_desc("Mutations.Branches.SelectBranch") }}

{{ get_typedoc_input("Mutations.Branches.SelectBranch") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.SelectBranch", "IOutput") }}

### Добавить доверенное лицо

{{ get_sdk_doc("Mutations", "Branches", "AddTrustedAccount") }} | {{ get_graphql_doc("Mutation.addTrustedAccount") }}

{{ get_typedoc_desc("Mutations.Branches.AddTrustedAccount") }}

{{ get_typedoc_input("Mutations.Branches.AddTrustedAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.AddTrustedAccount", "IOutput") }}

### Удалить доверенное лицо

{{ get_sdk_doc("Mutations", "Branches", "DeleteTrustedAccount") }} | {{ get_graphql_doc("Mutation.deleteTrustedAccount") }}

{{ get_typedoc_desc("Mutations.Branches.DeleteTrustedAccount") }}

{{ get_typedoc_input("Mutations.Branches.DeleteTrustedAccount") }}

Результат:

{{ get_typedoc_definition("Mutations.Branches.DeleteTrustedAccount", "IOutput") }}

{{ dev_blockchain_note() }}



