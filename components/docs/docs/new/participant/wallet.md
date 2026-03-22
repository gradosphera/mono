---
tags:
  - Пайщик
  - Разработчик
---

Страница "Кошелек" со стола пайщика отображает баланс лицевого счета пайщика по всем целевым потребительским программам и договорам, для которых у пайщика заведены кошельки.

Главный кошелек обеспечивает учёт взносов на лицевом счете пайщика по целевой потребительской програме "Цифровой Кошелек". Он же является центральным входом и выходом денег из цифрового кооператива для пайщиков, обеспечивая приём паевых взносов банковскими переводами и их возврат банковскими переводами.

Для участия в любых кооперативных приложениях на платформе пайщику необходимо сперва пополнить главный кошелек, потому как именно его баланс транслируется приложением по заявлению пайщика в кошелек договора участия в хозяйственной деятельности или кошелек целевой потребительской программы. Такие кошельки называются "кошельками проложений". 

Возврат средств из кошельков приложений осуществляется в обратном порядке - трансляция в главный кошелек, и затем возврат паевого взноса банковским переводом по заявлению пайщика. 

```mermaid
flowchart LR
    contrib[Паевой взнос] --> main["Главный кошелек"]
    refund[Возврат взноса] --> main
    main <-->|трансляция| subgraph_apps["Кошельки приложений"]
    subgraph_apps --> app1[Кошелек приложения A]
    subgraph_apps --> app2[Кошелек приложения B]
    subgraph_apps --> app3[Кошелек приложения C]
```
 

![модуль кошелька](/assets/new/participant_wallet_1.png)


## Главный кошелёк. 

Является центральным входом и выходом паевых взносов из системы. Чтобы начать участвовать в любом кооперативном приложении (целевой потребительской программе), необходимо пополнить главный кошелек.

![главный кошелек](/assets/new/participant_wallet_7.png)

Принимая участие в любом приложении, где ожидаются взносы (например, стол заказов) - они взносы будут производиться с главному кошелька по цифровому заявлению на зачёт средств паевого взноса с одной целевой потребительской программы в счет средств другой. 

Главный кошелек показывает два состояния паевых взносов по целевой потребительской программе "Цифровой Кошелек": доступные средства и заблокированные средства. 

Доступные средства доступны к возврату или участию в любых кооперативных приложениях. Заблокированные средства в случае главного кошелька, это средства, которые недоступны к возврату прямо сейчас. Такими средствами является, например, минимальный паевой взнос который возвращается пайщику при выходе из кооператива. Также, средства переходят из доступного - в заблокированное на период оплаты возврата паевого взноса до момента фактической оплаты кассиром. 

## Кошельки приложений

Когда средства с главного кошелька пайщика по заявлению пайщика  отправляются принимать участие в приложениях, то баланс средств в главном кошельке уменьшается, а баланс в кошельке приложения - увеличивается. Т.е. средства передается (транслируются) с главного кошелька - в кошелек конкретного приложения по заявлению пайщика. 

![кошельки приложений](/assets/new/participant_wallet_6.png)

Кошельки приложений связаны с целевыми потребительскими программами и/или договорами участия в хозяйственной деятельности, и открываются пайщику тогда, когда он подписывает соответствующий документ или публичную оферту в приложении. Приложение, например, "Благорост" или "Стол заказов" самостоятельно обеспечивают подпись необходимых соглашений и договоров, тем самым, открывая кошельки приложений пайщикам. 

У кошельков приложений, аналогично главному кошельку, есть доступные и заблокированные средства паевых взносов. Доступные средства приложения могут быть использованы для трансляции в главный кошелек или задействованы внутри приложения согласно его бизнес-процессу.

Кошельками приложений управляют кооперативные смарт-контракты согласно принятым стандартам. Один смарт-контракт может управлять одновременно несколькими кошельками приложений согласно своей бизнес-логике. Например, смарт-контракт "Благорост" открывает пайщикам одновременно два кошелька приложений: по договору участия в хозяйственной деятельности и по условиям публичной оферты целевой потребительской программы. 

Следует сказать, что смарт-контракты обычно автоматически возвращают средства из доступных средств кошелька приложения в главный кошелек по мере достижения условий завершения своего исполнения. Именно поэтому у кошельков приложений нет специализированных кнопок управления, вроде взносов и возвратов в и из кошельков приложений, т.к. все управление ими производится непосредственно на столах и страницах самих приложения. Здесь же, на странице кошелька пайщика, кошельки приложений представлены пайщику для мониторинга - где, сколько и в каком состоянии у него находится. 

## Микро-кошелек

Микро-кошелек отображает баланс главного кошелька и кнопки управления взносами в всегда доступном месте главного меню. 

![микро-кошелек](/assets/new/participant_wallet_2.png)

Находясь в любом приложении цифрового кооператива пайщику всегда доступен его баланс, которым он может принимать участие. При необходимости, он может как пополнить свой главный кошелек, совершив паевой взнос, так и запросить возврат паевого взноса, нажав соответствующие кнопки в микро-кошельке. 

## Разработчикам

{{ dev_schema_source() }}

### Получить программный кошелёк

{{ get_sdk_doc("Queries", "Wallet", "GetProgramWallet") }} | {{ get_graphql_doc("query.getProgramWallet") }}

{{ get_typedoc_desc("Queries.Wallet.GetProgramWallet") }}

{{ get_typedoc_input("Queries.Wallet.GetProgramWallet") }}

Результат:

{{ get_typedoc_definition("Queries.Wallet.GetProgramWallet", "IOutput") }}

### Список программных кошельков

{{ get_sdk_doc("Queries", "Wallet", "GetProgramWallets") }} | {{ get_graphql_doc("query.getProgramWallets") }}

{{ get_typedoc_desc("Queries.Wallet.GetProgramWallets") }}

{{ get_typedoc_input("Queries.Wallet.GetProgramWallets") }}

Результат:

{{ get_typedoc_definition("Queries.Wallet.GetProgramWallets", "IOutput") }}

### Получить информацию об аккаунте

{{ get_sdk_doc("Queries", "Accounts", "GetAccount") }} | {{ get_graphql_doc("Query.getAccount") }}

{{ get_typedoc_desc("Queries.Accounts.GetAccount") }}

{{ get_typedoc_input("Queries.Accounts.GetAccount") }}

Результат:

{{ get_typedoc_definition("Queries.Accounts.GetAccount", "IOutput") }}

### Создать платёж (депозит), модуль Gateway

{{ get_sdk_doc("Mutations", "Gateway", "CreateDepositPayment") }} | {{ get_graphql_doc("Mutation.createDepositPayment") }}

{{ get_typedoc_desc("Mutations.Gateway.CreateDepositPayment") }}

{{ get_typedoc_input("Mutations.Gateway.CreateDepositPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.CreateDepositPayment", "IOutput") }}

### Создать платёж (депозит), модуль Wallet

{{ get_sdk_doc("Mutations", "Wallet", "CreateDepositPayment") }} | {{ get_graphql_doc("Mutation.createDepositPayment") }}

{{ get_typedoc_desc("Mutations.Wallet.CreateDepositPayment") }}

{{ get_typedoc_input("Mutations.Wallet.CreateDepositPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.CreateDepositPayment", "IOutput") }}

### Создать начальный платёж

{{ get_sdk_doc("Mutations", "Gateway", "CreateInitialPayment") }} | {{ get_graphql_doc("Mutation.createInitialPayment") }}

{{ get_typedoc_desc("Mutations.Gateway.CreateInitialPayment") }}

{{ get_typedoc_input("Mutations.Gateway.CreateInitialPayment") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.CreateInitialPayment", "IOutput") }}

### Изменить статус платежа

{{ get_sdk_doc("Mutations", "Gateway", "SetPaymentStatus") }} | {{ get_graphql_doc("Mutation.setPaymentStatus") }}

{{ get_typedoc_desc("Mutations.Gateway.SetPaymentStatus") }}

{{ get_typedoc_input("Mutations.Gateway.SetPaymentStatus") }}

Результат:

{{ get_typedoc_definition("Mutations.Gateway.SetPaymentStatus", "IOutput") }}

### Заявление на возврат паевого взноса (документ)

{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyStatementDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyStatementDocument") }}

{{ get_typedoc_desc("Mutations.Wallet.GenerateReturnByMoneyStatementDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyStatementDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyStatementDocument", "IOutput") }}

### Решение совета о возврате паевого взноса (документ)

{{ get_sdk_doc("Mutations", "Wallet", "GenerateReturnByMoneyDecisionDocument") }} | {{ get_graphql_doc("Mutation.generateReturnByMoneyDecisionDocument") }}

{{ get_typedoc_desc("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument") }}

{{ get_typedoc_input("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument") }}

Результат:

{{ get_typedoc_definition("Mutations.Wallet.GenerateReturnByMoneyDecisionDocument", "IOutput") }}



