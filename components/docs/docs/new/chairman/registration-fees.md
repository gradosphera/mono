---
tags:
  - Председатель
  - Разработчик
---

Страница управления позволяет изменить размер вступительных и минимальных паевых взносов отдельно для юридических лиц и отдельно для физических лиц и индивидуальных предпринимателей. Изменения должны иметь юридические основания. Обычно, размер взносов прописывается в Уставе кооператива. 


![управление платежами](/assets/new/chairman_fees_1.png)

## Разработчикам

{{ dev_schema_source() }}

### Где хранятся суммы взносов

Отдельной мутации GraphQL «только взносы» в схеме нет. Величины хранятся в строке кооператива в таблице `coops` контракта `registrator` (поля `initial`, `minimum`, `org_initial`, `org_minimum` в `cooptypes`: `RegistratorContract.Tables.Cooperatives.ICooperative`). Рабочий стол читает их через RPC (`fetchTable` → `src/entities/Cooperative/api`).

### Запись (как в UI председателя)

Действие `updatecoop` контракта `registrator`, тип `RegistratorContract.Actions.UpdateCoop` (`src/features/Cooperative/UpdateCoop` на десктопе).

{{ dev_blockchain_note() }}



