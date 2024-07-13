# COOPTYPES.

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Модуль cooptypes содержит информацию для работы со смарт-контрактами кооперативной
экономики. В этом модуле представлены реестры действий и таблиц каждого
смарт-контракта, а также имена аккаунтов для разных блокчейн-сетей.

Каждое действие содержит интерфейс транзакции, информацию о требуемой авторизации и имя действия, которое нужно вызвать на уровне смарт-контракта.

Каждая таблица содержит интерфейс для работы с данными и информацию о пространстве хранения информации в блокчейне.

## Как пользоваться
Перейти на страницу документации и ознакомиться с набором пространств имен контрактов, в каджом из которых есть действия и таблицы, а также, интерфейсы данных, имена контрактов, пространств хранения и требуемая авторизация. Всё это доступно из интерфейса IDE после импорта контракта.

### Получение таблиц

```
import EosApi from 'eosjs-api';
import {SovietContract} from 'cooptypes'

const options = {
    httpEndpoint: 'http://127.0.0.1:8888',
  };

const api = new EosApi(options);
const coopname = 'testcoop' - тестовое имя аккаунта кооператива

const _scope = SovietContract.Tables.Boards.scope
```

Получив _scope, необходимо проверить его и подставить переменную:

```
let scope

if (_scope === '_coopname' )
  scope = coopname
if (_scope === '_username)
  scope = username
... и так далее

```
scope - это области памяти хранения информации в смарт-контракте, которые представлены в виде универсальных параметров _username, _coopname или прочих, в соответствии с которыми необходимо подставить переменную.

Например, для получения таблицы с членами совета кооператива, необходимо подставить область памяти _coopname, или, 'testcoop', как было определено выше для тестового кооператива. Также, вместо _coopname могут быть указаны имена других контрактов или пользователей. Область памяти определяется тем, как именно смарт-контракт хранит информацию.

После подстановок, мы можем получить информацию из таблицы смарт-контракта блокчейна:
```
api.getTableRows(
    {
        json: true,
        code: SovietContract.contractName.production, //извлекаем имя контракта
        scope, //подставляем ранее полученную область памяти
        table: SovietContract.Tables.Boards.tableName, //извлекаем имя таблицы в контракте
        limit: 10, // устанавливаем лимит

        // не обязательные параметры запроса
        /*  upper_bound, // - верхняя граница
            lower_bound, // - нижняя граница
            key_type, // - тип ключа
            index_position, // нижняя граница
        */
    })
```

Те же параметры scope, table, code могут быть использованы для получения информации из модуля [COOPARSER](https://github.com/copenomics/cooparser). Последнее используется, когда необходимо получить исторические данные и нет необходимости проверять их актуальность по наличию таблиц в блокчейне. Однако, таблицы в блокчейне необходимо всегда проверять перед отправкой любой транзакции действия. Нельзя полагаться на данные из парсера при подготовке транзакции действия.

### Транзакция действий
Состояние любого смарт-контракта может изменяться только с помощью действий. Для того, чтобы совершить действия, необходимо сформировать и отправить транзакцию с помощью библиотеки eosjs или альтернатив.

```
import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { TextEncoder, TextDecoder } from 'util';
import fetch from 'isomorphic-fetch';

const signatureProvider = new JsSignatureProvider([wif]);
const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
```

транзакция может содержать в себе массив действий, которые будут применяться последовательно друг за другом. Ниже мы сформируем транзакцию регистрации нового аккаунта, которая может быть вызвана только администратором или председателем кооператива.

```
  const result = await eos.transact(
    {
      actions: [
        {
          //здесь мы извлекаем имя контракта
          account: RegistratorContract.contractName.production,
          //здесь мы извлекаем имя действия
          name: RegistratorContract.Actions.CreateAccount.actionName,
          authorization: [
            {
              // требуемые авторизации хранятся в RegistratorContract.Actions.CreateAccount.authorizations, откуда могут быть извлечены программно или вручную.
              actor: chairman,
              permission: 'active',
            },
          ],
          data: {
            // подставляем данные действия
          } as RegistratorContract.Actions.CreateAccount.ICreateAccount,
          // здесь извлекаем интерфейс для действия
        },
      ]
    }
  );
```

## Лицензия

[MIT](./LICENSE) License © 2024-PRESENT [CBS VOSKHOD](https://github.com/copenomics)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/cooptypes?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/cooptypes
[npm-downloads-src]: https://img.shields.io/npm/dm/cooptypes?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/cooptypes
[bundle-src]: https://img.shields.io/bundlephobia/minzip/cooptypes?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=cooptypes
[license-src]: https://img.shields.io/github/license/copenomics/cooptypes.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/copenomics/cooptypes/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/cooptypes
