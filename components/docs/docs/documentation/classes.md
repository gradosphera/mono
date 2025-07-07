MONO SDK предоставляет набор вспомогательных классов для работы с различными аспектами системы. Все классы доступны через пространство имён `Classes` в SDK клиенте.

```ts
import { Classes } from '@coopenomics/sdk'
```

## Account

Класс {{ get_class_doc("Account") }} предназначен для генерации новых аккаунтов с уникальными именами и криптографическими ключами.

{{ get_typedoc_desc("Classes.Account") }}

### Основные методы

- **`constructor()`** - создаёт новый экземпляр аккаунта
- **`generateUsername()`** - генерирует случайное имя аккаунта (12 символов)
- **`generateKeys()`** - создаёт пару ключей (приватный/публичный)

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

// Создание нового аккаунта
const newAccount = new Classes.Account()

console.log(newAccount.username)     // "abcdxyzuvwrs"
console.log(newAccount.private_key)  // "5JxyzABC1234567890defGHIJKLMNopqRSTUV"
console.log(newAccount.public_key)   // "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5SozEZ8i8jUBS6yX79y6"
```

## Canvas

Класс {{ get_class_doc("Canvas") }} обеспечивает создание интерактивного холста для сбора собственноручной подписи пайщика в формате, совместимом с требованиями MONO.

{{ get_typedoc_desc("Classes.Canvas") }}

### Основные методы

- **`constructor(container, options)`** - создаёт холст в указанном контейнере
- **`clearCanvas()`** - очищает содержимое холста
- **`getSignature()`** - извлекает подпись в формате base64
- **`destroy()`** - освобождает ресурсы и удаляет обработчики событий

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

// Получаем контейнер для размещения холста
const container = document.getElementById('signature-container') as HTMLElement

// Создаём экземпляр Canvas для работы с подписью
const signatureCanvas = new Classes.Canvas(container, {
  lineWidth: 5,
  strokeStyle: '#000'
})

// Пользователь рисует подпись...

// Извлечение подписи в формате base64
const signature = signatureCanvas.getSignature()
console.log('Подпись в формате base64:', signature)

// Очистка холста при необходимости
signatureCanvas.clearCanvas()

// Освобождение ресурсов
signatureCanvas.destroy()
```

## Document

Класс {{ get_class_doc("Document") }} предоставляет инструменты для цифрового подписания документов с использованием WIF-ключей и проверки подписей.

{{ get_typedoc_desc("Classes.Document") }}

### Основные методы

- **`constructor(wifKey?)`** - инициализация с опциональным WIF-ключом
- **`setWif(wifKey)`** - установка/замена WIF-ключа
- **`signDocument(document, account, signatureId, existingSignedDocuments?)`** - подписание документа
- **`static validateDocument(document)`** - валидация подписанного документа
- **`static finalize(document)`** - финализация документа для отправки в блокчейн
- **`static parse(document)`** - парсинг документа из блокчейна

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

const wifKey = "your-wif-private-key"
const docSigner = new Classes.Document(wifKey)

const generatedDoc = {
  full_title: "Пример документа",
  html: "<p>Это пример документа</p>",
  hash: "hash_of_document",
  meta: { author: "Автор документа" },
  binary: "binary_data"
}

// Подписание документа
const signedDoc = await docSigner.signDocument(generatedDoc, "username", 1)

// Проверка валидности подписанного документа
const isValid = Classes.Document.validateDocument(signedDoc)
console.log('Документ валиден:', isValid)
```

## Blockchain

Класс {{ get_class_doc("Blockchain") }} обеспечивает взаимодействие с блокчейном COOPOS, включая выполнение транзакций и работу с таблицами смарт-контрактов.

{{ get_typedoc_desc("Classes.Blockchain") }}

### Основные методы

- **`constructor(config)`** - инициализация с конфигурацией блокчейна
- **`setWif(username, wif, permission?)`** - установка приватного ключа для транзакций
- **`getInfo()`** - получение информации о блокчейне
- **`transact(actions, broadcast?)`** - выполнение транзакций
- **`getAllRows(code, scope, tableName)`** - получение всех строк таблицы
- **`query(code, scope, tableName, options)`** - запрос строк с фильтрацией
- **`getRow(code, scope, tableName, primaryKey, indexPosition?)`** - получение одной строки

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

const blockchain = new Classes.Blockchain({
  chain_url: "https://api.coopenomics.world",
  chain_id: "6e37f9ac0f0ea717bfdbf57d1dd5d7f0e2d773227d9659a63bbf86eec0326c1b"
})

// Установка ключа для подписания транзакций
blockchain.setWif("username", "your-wif-key")

// Получение информации о блокчейне
const info = await blockchain.getInfo()
console.log('Блокчейн инфо:', info)

// Выполнение транзакции
const result = await blockchain.transact({
  account: 'eosio.token',
  name: 'transfer',
  data: {
    from: 'sender',
    to: 'receiver',
    quantity: '1.0000 EOS',
    memo: 'Перевод'
  }
})

// Получение данных из таблицы
const accounts = await blockchain.getAllRows('eosio.token', 'EOS', 'accounts')
console.log('Аккаунты:', accounts)
```

## Crypto

Класс {{ get_class_doc("Crypto") }} предоставляет криптографические функции, работающие как в браузере, так и в Node.js окружении.

{{ get_typedoc_desc("Classes.Crypto") }}

### Основные методы

- **`static sha256(data)`** - получение SHA-256 хэша от строки или числа

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

// Получение хэша строки
const hash1 = await Classes.Crypto.sha256("Hello World")
console.log('Хэш строки:', hash1)

// Получение хэша числа
const hash2 = await Classes.Crypto.sha256(12345)
console.log('Хэш числа:', hash2)

// Работает в браузере и Node.js
```

## Vote

Класс {{ get_class_doc("Vote") }} предназначен для создания и проверки цифровых подписей при голосовании членов совета кооператива.

{{ get_typedoc_desc("Classes.Vote") }}

### Основные методы

- **`constructor(wifKey?)`** - инициализация с опциональным WIF-ключом
- **`setWif(wifKey)`** - установка/замена WIF-ключа
- **`voteFor(coopname, username, decision_id)`** - создание подписи для голоса "ЗА"
- **`voteAgainst(coopname, username, decision_id)`** - создание подписи для голоса "ПРОТИВ"
- **`static validateVote(data)`** - валидация подписи голоса
- **`static validateVoteWithHashCheck(data)`** - расширенная валидация с проверкой хэша

### Пример использования

```ts
import { Classes } from '@coopenomics/sdk'

const wifKey = "your-wif-private-key"
const voteSigner = new Classes.Vote(wifKey)

// Голосование за решение
const voteForData = await voteSigner.voteFor("coop1", "member1", 123)
console.log('Голос ЗА:', voteForData)

// Голосование против решения
const voteAgainstData = await voteSigner.voteAgainst("coop1", "member1", 124)
console.log('Голос ПРОТИВ:', voteAgainstData)

// Проверка валидности голоса
const isValid = Classes.Vote.validateVote(voteForData)
console.log('Голос валиден:', isValid)

// Расширенная проверка с валидацией хэша
const isValidWithHash = await Classes.Vote.validateVoteWithHashCheck(voteForData)
console.log('Голос валиден (с проверкой хэша):', isValidWithHash)
```

## Использование в SDK клиенте

Все классы также доступны через экземпляр SDK клиента:

```ts
import { Client } from '@coopenomics/sdk'

const client = Client.create({
  api_url: "http://127.0.0.1:2998/v1/graphql",
  chain_url: "https://api.coopenomics.world",
  chain_id: "6e37f9ac0f0ea717bfdbf57d1dd5d7f0e2d773227d9659a63bbf86eec0326c1b"
})

// Доступ к классам через клиент
const newAccount = new client.Classes.Account()
const signature = client.Classes.Canvas(container)
const docSigner = client.Classes.Document(wifKey)
``` 