# @coopenomics/sdk

[@coopenomics/sdk](https://coopenomics.world) — это SDK-клиент, обеспечивающий удобный программный доступ к запросам, мутациям и подпискам [GraphQL-API](/graphql) с полной типизацией входных и выходных данных на TypeScript. Он предназначен для интеграции с `MONO` и [Кооперативной Экономикой](https://coopenomics.world), упрощая взаимодействие с системой.

## Документация
https://цифровой-кооператив.рф/documentation

## Возможности SDK

- **Запросы** к `MONO` с автоматической типизацией.
- **Мутации** данных с валидацией входных параметров.
- **Подписки** на события в системе.
- **Классы** для работы с блокчейном, цифровыми подписями и документами.
- **Интеграция с блокчейном**, включая отправку транзакций.
- **Поддержка JWT-токенов** для аутентификации.

## Установка

```sh
npm install @coopenomics/sdk
# или
pnpm add @coopenomics/sdk
```

Подключение

```ts
import { createClient } from '@coopenomics/sdk'

// создаём клиент
const client = createClient({
  api_url: "http://127.0.0.1:2998/v1/graphql", // адрес MONO GraphQL-API
  chain_url: "https://api.coopenomics.world", // адрес конечной точки блокчейна
  chain_id: "6e37f9ac0f0ea717bfdbf57d1dd5d7f0e2d773227d9659a63bbf86eec0326c1b", // идентификатор цепочки блоков
});
```

Аутентификация выполняется с помощью JWT:

```ts
client.setToken('<your_access_token>')
```


## Запросы
Для выполнения запросов используйте пространство Queries. Например, получение данных об аккаунте:

```ts
import { Queries } from '@coopenomics/sdk'

const variables: Queries.Accounts.GetAccount.IInput = {
  data: { username: '<username>' }
};

const { [Queries.Accounts.GetAccount.name]: result } = await client.Query(
  Queries.Accounts.GetAccount.query,
  { variables }
);
```

Результат будет типизирован в соответствии с Queries.Accounts.GetAccount.IOutput.

## Мутации
Для изменения данных используется пространство Mutations. Например, создание паевого взноса:

```ts
import { Mutations } from '@coopenomics/sdk'

const variables: Mutations.Payments.CreateDepositPayment.IInput = {
  data: { username: '<username>', quantity: '100.00' }
};

const { [Mutations.Payments.CreateDepositPayment.name]: result } = await client.Mutation(
  Mutations.Payments.CreateDepositPayment.mutation,
  { variables }
);
```

Результат будет типизирован в соответствии с Mutations.Payments.CreateDepositPayment.IOutput.

### Работа с блокчейном
SDK включает классы для взаимодействия с блокчейном, например:

```ts

import { Blockchain } from '@coopenomics/sdk'

const blockchain = new Blockchain(client)
blockchain.setWif(<username>, <wif>)

const tableData = await blockchain.getAllRows('some_contract', 'some_scope', 'some_table')
```

### Использование списков Zeus
Некоторые мутации требуют списки значений, например, установка статуса платежа:

```ts
import { Zeus, Mutations } from '@coopenomics/sdk'

const variables: Mutations.Payments.SetPaymentStatus.IInput = {
  data: { id: '<payment_id>', status: Zeus.PaymentStatus.PAID }
};

const { [Mutations.Payments.SetPaymentStatus.name]: result } = await client.Mutation(
  Mutations.Payments.SetPaymentStatus.mutation,
  { variables }
);
```

Полный список доступных значений находится в документации SDK.

### Дополнительная информация
Общая документация: https://цифровой-кооператив.рф/documentation

Руководство по SDK: https://цифровой-кооператив.рф/sdk

Документация GraphQL API: https://цифровой-кооператив.рф/graphql

Кооперативная Экономика: https://coopenomics.world


## Лицензия
Продукт Потребительского Кооператива "ВОСХОД" распространяется по лицензии BY-NC-SA 4.0.

Разрешено делиться, копировать и распространять материал на любом носителе и форме, адаптировать, делать ремиксы, видоизменять и создавать новое, опираясь на этот материал. При использовании, Вы должны обеспечить указание авторства, предоставить ссылку, и обозначить изменения, если таковые были сделаны. Если вы перерабатываете, преобразовываете материал или берёте его за основу для производного произведения, вы должны распространять переделанные вами части материала на условиях той же лицензии, в соответствии с которой распространяется оригинал. Запрещено коммерческое использование материала. Использование в коммерческих целях – это использование, в первую очередь направленное на получение коммерческого преимущества или денежного вознаграждения.

Юридический текст лицензии: https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.ru

© 2025 Потребительский Кооператив "ВОСХОД". Все права защищены.


