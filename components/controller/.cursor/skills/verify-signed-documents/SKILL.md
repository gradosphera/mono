---
name: verify-signed-documents
description: Проверяет подписанный документ против черновика в Mongo (хэши SDK) и опционально поля meta. Использовать при мутациях/действиях с подписанным заявлением, сверке с генерацией, защите от подмены документа или суммы в controller.
---

# Сверка подписанного документа с черновиком (controller)

## Когда вызывать

Перед отправкой в блокчейн (или сохранением), если клиент передал **подписанный** документ, который должен соответствовать **ранее сгенерированному** PDF в Mongo (ключ коллекции `documents` — поле `hash`, совпадает с **`doc_hash`** подписанного документа).

## Стандартный путь

Использовать утилиту:

`src/utils/signed-document-draft-verification.util.ts` → **`verifySignedDocumentAgainstStoredDraft`**

Параметры:

1. **`loadGeneratedByDocHash`** — лямбда `(docHash) => documentInteractor.getDocumentByHash(docHash)` (или эквивалент через репозиторий). Утилита не импортирует Nest-сервисы.
2. **`signed`** — `ISignedDocumentDomainInterface` (подписанное заявление из DTO/домена).
3. **`metaVerifications`** — необязательный массив `{ field, expected, mode }`:
   - **`currency_amount`** — суммы в формате asset; сравнение через `CurrencyValidationUtil.extractAmountValue` + `formatAmount`.
   - **`string_trim`** — точное совпадение после `trim`.
   - **`hex_case_insensitive`** — хэши/checksum256 в регистронезависимом виде.

Порядок внутри утилиты: загрузка черновика → **`Classes.Document.compareDocuments`** (глубокая сверка `version`, `hash`, `doc_hash`, `meta_hash`) → затем по очереди все пункты `metaVerifications`.

Если третий аргумент не передан или пустой массив — только сверка по хэшам с черновиком.

## Пример (сервис с `DocumentInteractor`)

```typescript
import { verifySignedDocumentAgainstStoredDraft } from '~/utils/signed-document-draft-verification.util';

await verifySignedDocumentAgainstStoredDraft(
  (docHash) => this.documentInteractor.getDocumentByHash(docHash),
  data.statement,
  [
    { field: 'amount', expected: data.amount, mode: 'currency_amount' },
    { field: 'project_hash', expected: data.project_hash, mode: 'hex_case_insensitive' },
  ],
);
```

## Эталон в кодовой базе

- **`InvestsManagementService`** — программная и проектная инвестиция.
- **`ResultSubmissionService.pushResult`** — ручная связка `getDocumentByHash` + `compareDocuments` (до появления утилиты); смысл тот же.

## Ограничения

- **`compareDocuments`** в SDK ожидает формы, совместимые с `IGeneratedDocument` / `ISignedDocument`; для сущности из Mongo передаётся объект, совместимый по полям (как в существующих вызовах с приведением типов в утилите).
- Новые режимы сравнения meta добавлять в **`SignedDocumentMetaCompareMode`** и в `switch` утилиты, не дублировать логику в сервисах.
