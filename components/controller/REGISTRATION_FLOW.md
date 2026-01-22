# 🔄 Динамический поток регистрации

Система регистрации полностью управляется через конфигурацию без хардкода в бизнес-логике.

## 📋 Источники конфигурации

### 1. Конфигурация соглашений
**Файл**: `src/domain/registration/config/registration-agreements.config.ts`

Определяет все доступные соглашения:

```typescript
{
  id: 'generator_offer',
  registry_id: 996,
  agreement_type: 'generator',  // ← Используется при отправке в блокчейн
  title: 'Оферта по программе "Генератор"',
  is_blockchain_agreement: true,
  link_to_statement: true,
  applicable_account_types: [],
  order: 6,
}
```

### 2. Конфигурация программ
**Файл**: `src/domain/registration/config/registration-programs.config.ts`

Определяет доступные программы регистрации:

```typescript
{
  key: 'generation',
  title: 'Программа Генерация',
  description: '...',
  applicable_account_types: [AccountType.individual, AccountType.entrepreneur],
  agreement_ids: ['generator_offer'],  // ← Связь с соглашениями
  order: 1,
}
```

## 🔄 Как это работает

### 1️⃣ Генерация документов
**Сервис**: `RegistrationDocumentsService.generateRegistrationDocuments()`

```typescript
// Получаем соглашения из конфигурации
const agreementsConfig = this.agreementConfigService.getAgreementsForAccountType(
  account_type,
  coopname,
  program_key  // ← Ключ выбранной программы
);

// Генерируем документы для каждого соглашения
for (const config of agreementsConfig) {
  const document = await generateDocument({
    registry_id: config.registry_id,
    ...
  });
}
```

### 2️⃣ Валидация при регистрации
**Интерактор**: `ParticipantInteractor.registerParticipant()`

```typescript
// ПРОВЕРКА 1: Получаем требуемые соглашения из конфигурации
const requiredAgreements = this.agreementConfigService.getRequiredAgreementIds(
  candidate.type,
  config.coopname,
  data.program_key  // ← Передаем ключ программы
);

// ПРОВЕРКА 2: Валидируем все требуемые документы динамически
const documentsToValidate = [{ id: 'statement', document: data.statement }];

for (const agreementId of requiredAgreements) {
  if (data[agreementId]) {
    documentsToValidate.push({ id: agreementId, document: data[agreementId] });
  } else {
    missingAgreements.push(agreementId);
  }
}

// ПРОВЕРКА 3: Проверяем линкованные документы из конфигурации
const linkedAgreements = this.agreementConfigService.getLinkedAgreements(
  candidate.type,
  config.coopname,
  data.program_key  // ← Передаем ключ программы
);

// СОХРАНЕНИЕ: Сохраняем все требуемые соглашения
for (const agreementId of requiredAgreements) {
  if (data[agreementId]) {
    await this.candidateRepository.saveDocument(username, agreementId, data[agreementId]);
  }
}
```

### 3️⃣ Отправка в блокчейн
**Адаптер**: `AccountBlockchainAdapter.registerBlockchainAccount()`

```typescript
// Получаем соглашения для блокчейна из конфигурации
const blockchainAgreements = this.agreementConfigService.getBlockchainAgreements(
  accountType,
  config.coopname,
  candidate.program_key  // ← Используем сохраненный ключ программы
);

// Динамически добавляем транзакции sendAgreement
for (const agreementConfig of blockchainAgreements) {
  const document = candidate.documents[agreementConfig.id];

  if (document) {
    const action = this.createSendAgreementAction(
      candidate.username,
      agreementConfig.agreement_type,  // ← Берем из конфигурации!
      document
    );
    actions.push(action);
  }
}
```

## ✨ Преимущества

### ✅ Никакого хардкода
```typescript
// ❌ ПЛОХО - хардкод
if (data.program_key === 'generation' && data.generator_offer) {
  documentsToValidate.push({ id: 'generator_offer', document: data.generator_offer });
}

// ✅ ХОРОШО - динамика из конфигурации
for (const agreementId of requiredAgreements) {
  if (data[agreementId]) {
    documentsToValidate.push({ id: agreementId, document: data[agreementId] });
  }
}
```

### ✅ Легко добавить новую программу

1. Добавляем соглашение в `registration-agreements.config.ts`:
```typescript
{
  id: 'new_program_offer',
  agreement_type: 'new_type',
  registry_id: 1001,
  ...
}
```

2. Добавляем программу в `registration-programs.config.ts`:
```typescript
{
  key: 'new_program',
  title: 'Новая программа',
  agreement_ids: ['new_program_offer'],
  ...
}
```

3. **Всё!** Код работает без изменений 🎉

### ✅ Единый источник истины

Конфигурация определяет:
- Какие документы генерировать
- Какие документы валидировать
- Какие документы линковать в заявление
- Какие документы сохранять
- Какие транзакции отправлять в блокчейн
- Какой `agreement_type` использовать

## 🔍 Полный цикл для программы "Генерация"

```
1. Frontend → generateRegistrationDocuments({ program_key: 'generation' })
                          ↓
2. Backend определяет: generation → ['generator_offer']
                          ↓
3. Генерируется документ с registry_id=996
                          ↓
4. Frontend подписывает документы
                          ↓
5. Frontend → registerParticipant({ program_key: 'generation', generator_offer: {...} })
                          ↓
6. Backend валидирует все требуемые документы (динамически)
                          ↓
7. Backend сохраняет program_key и все документы
                          ↓
8. Payment → registerBlockchainAccount(candidate)
                          ↓
9. Backend получает соглашения для блокчейна на основе candidate.program_key
                          ↓
10. Backend отправляет sendAgreement с agreement_type='generator'
```

## 📝 Итог

**Вся система управляется через конфигурацию!**

Добавление новых программ и соглашений не требует изменения бизнес-логики - только обновление конфигурационных файлов.
