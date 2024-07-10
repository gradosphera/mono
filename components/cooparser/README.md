# COOPARSER

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Пакет производит распаковку блоков, сохраняя действия и дельты таблиц и выдавая их по API. Состоит из двух модулей: парсера и API. Парсер считывает данные из блокчейна и помещает их в базу. API получает данные по запросу и возвращает их с пагинацией.

## Установка
```
pnpm install
```

### Конфигурационный файл .env
```
NODE_ENV=development
- Определяет среду выполнения приложения.

API=http://127.0.0.1:8888
- Определяет URL-адрес API, к которому будет осуществляться доступ.

SHIP=ws://127.0.0.1:8080
- Определяет URL-адрес WebSocket-соединения, используемого для связи с другими узлами.

MONGO_EXPLORER_URI=mongodb://127.0.0.1:27017/cooperative
- Определяет URI-адрес MongoDB, используемый для подключения к базе данных.

START_BLOCK=1
- Определяет номер блока, с которого начинается парсинг блокчейна.

FINISH_BLOCK=0xFFFFFFFF
- Определяет номер блока, на котором заканчивается парсинг блокчейна. В данном случае, установлено значение "0xFFFFFFFF", что означает, что парсинг будет продолжаться до последнего доступного блока.

PORT=4000
- Определяет порт, на котором будет запущен сервер приложения.

ACTIVATE_PARSER=0
- Определяет флаг активации парсера. Если значение равно "1", парсер будет активирован.
```

### Конфигурация парсера
В конфиге src/config.ts находится массив таблиц и действий, на которые парсер осуществит подписку.

```
export const subsribedTables = [
  { code: 'registrator', table: 'users', 'scope': 'registrator' },
  { code: 'soviet', table: 'participants' },
]
```
- подписка будет осуществлена на изменения таблиц указанных контрактов. Параметр scope - не обязательный. Без его указания любые scope будут попадать в базу данных.

```
export const subsribedActions = [
  { code: 'soviet', action: 'votefor' },
  { code: 'soviet', action: 'voteagainst' },
]
```
- подписка будет осуществлена на действия указанных контрактов.

Парсер может быть расширен любыми кастомными действиями, которые будут выполняться перед добавлением записи в базу данных. Для этого, для таблиц и действий соответственно, в папках src/ActionParser/Actions и src/DeltaParser/Deltas необходимо создать файлы с методами обработки и добавить их к src/ActionParser/Actions или src/DeltaParser/DeltaFactory.

### Запуск
```
pnpm start
```

## API

### Получение таблиц
Конечная точка предоставляет информацию о изменении (дельтах) таблиц между блоками.

```

let params = {
  page: 1,
  limit: 10,
  filter: {  } - любые параметры фильтрации таблицы, включая данные в полях
};

axios.get('http://localhost:4000/get-tables', { params })
  .then(response => {
    console.log(response.data);
    //  {
    //    results: array,
    //    page: number,
    //    limit: number
    //  };
  })
```

### Получение действий
Конечная точка предоставляет информацию о действиях, произошедших между блоками.

```
let params = {
  page: 1,
  limit: 10,
  filter: {  } // любые параметры фильтрации действий, включая данные в полях
};

axios.get('http://localhost:4000/get-actions', { params })
  .then(response => {
    console.log(response.data);
    //  {
    //    results: array,
    //    page: number,
    //    limit: number
    //  };
  })
  .catch(error => {
    console.error(error);
  });
```

### Получение текущего блока
Конечная точка предоставляет информацию о текущем блоке. Эта информация используется при формировании кооперативных документов.

```
axios.get('http://localhost:4000/get-current-block')
  .then(response => {
    console.log(response.data);
    // number
  })
  .catch(error => {
    console.error(error);
  });
```

## Лицензия

[MIT](./LICENSE) License © 2024-PRESENT [CBS VOSKHOD](https://github.com/copenomics)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/cooparser?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/cooparser
[npm-downloads-src]: https://img.shields.io/npm/dm/cooparser?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/cooparser
[bundle-src]: https://img.shields.io/bundlephobia/minzip/cooparser?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=cooparser
[license-src]: https://img.shields.io/github/license/copenomics/cooparser.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/copenomics/cooparser/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/cooparser
