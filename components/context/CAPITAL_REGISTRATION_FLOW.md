# Система регистрации в CAPITAL: выбор пути

## Обзор

Система регистрации в CAPITAL поддерживает два пути регистрации участников кооператива: **Благорост** и **Генератор**. Каждый путь определяет набор документов, которые необходимо подписать участнику для завершения регистрации.

## Архитектура потоков

### 1. Первоначальный выбор программы (SignUp.vue)

**Местоположение:** `desktop/src/pages/Registrator/SignUp/SignUp.vue`

На этапе первичной регистрации пользователь выбирает одну из двух программ:
- **Программа Благорост** - подписывается `BlagorostOffer` (офферта Благорост)
- **Программа Генератор** - подписывается `GeneratorOffer` (офферта Генератор)

Выбор сохраняется в поле `program_key` сущности `Contributor`:
- `GENERATION` - для программы Генератор
- `CAPITALIZATION` - для программы Благорост

### 2. Завершение регистрации (CapitalRegistrationPage.vue)

**Местоположение:** `desktop/extensions/capital/pages/CapitalRegistrationPage/ui/CapitalRegistrationPage.vue`

После первоначального выбора на странице завершения регистрации генерируется разный набор документов:

#### Путь Генератора (`program_key = GENERATION`)
Генерируются и подписываются **3 документа**:
1. `GenerationContract` (Договор УХД) - всегда
2. `StorageAgreement` (Соглашение о хранении имущества) - всегда
3. `BlagorostAgreement` (Соглашение Благорост) - только для этого пути

#### Путь Благороста (`program_key = CAPITALIZATION`)
Генерируются и подписываются **2 документа**:
1. `GenerationContract` (Договор УХД) - всегда
2. `StorageAgreement` (Соглашение о хранении имущества) - всегда
3. `BlagorostAgreement` НЕ генерируется (уже подписано через оферту)

## Сохранение данных

### Contributor entity
```typescript
program_key?: string;                    // Ключ выбранной программы
blagorost_offer_hash?: string;           // Хеш подписанной оферты Благорост
generator_offer_hash?: string;           // Хеш подписанной оферты Генератор
generation_contract_hash?: string;       // Хеш подписанного договора УХД
storage_agreement_hash?: string;         // Хеш подписанного соглашения о хранении
blagorost_agreement_hash?: string;       // Хеш подписанного соглашения Благорост
```

### Udata параметры документов
Для каждого документа генерируются уникальные параметры:
```typescript
// Благорост
blagorost_agreement_number: string;      // Номер соглашения
blagorost_agreement_created_at: string;  // Дата создания

// Генератор
generator_agreement_number: string;      // Номер соглашения
generator_agreement_created_at: string;  // Дата создания

// Договор УХД
generation_contract_number: string;      // Номер договора
generation_contract_created_at: string;  // Дата создания

// Соглашение о хранении
storage_agreement_number: string;        // Номер соглашения
storage_agreement_created_at: string;    // Дата создания
```

## Ключевые особенности

1. **Условная генерация**: Набор документов зависит от первоначального выбора программы
2. **Единая точка сохранения**: Один ключ `blagorost_agreement_number` используется для параметров соглашения Благорост, независимо от того, подписано ли оно через оферту или отдельно
3. **Проверка завершения**: Регистрация считается завершенной при наличии `generation_contract_hash` и `storage_agreement_hash`
4. **Блокчейн интеграция**: Все подписанные документы отправляются в блокчейн через действие `regcontrib`

## API endpoints

### Генерация документов
```graphql
mutation GenerateCapitalRegistrationDocuments($data: GenerateCapitalRegistrationDocumentsInputDTO!) {
  generateCapitalRegistrationDocuments(data: $data) {
    generation_contract { html, hash }
    storage_agreement { html, hash }
    blagorost_agreement { html, hash }  # опционально
  }
}
```

### Отправка в блокчейн
```graphql
mutation CompleteCapitalRegistration($data: CompleteCapitalRegistrationInputDTO!) {
  completeCapitalRegistration(data: $data) {
    transaction_id
  }
}
```

## Расширения и сервисы

- **ParticipationManagementInteractor**: бизнес-логика регистрации
- **UdataDocumentParametersService**: генерация параметров документов
- **RegistrationDocumentsService**: генерация пакета документов
- **useGenerateCapitalRegistrationDocuments**: фронтенд-композабл для генерации
- **useCompleteCapitalRegistration**: фронтенд-композабл для отправки в блокчейн