# Руководство по добавлению документов в онбординг председателя кооператива (Благорост)

## Обзор системы

Онбординг председателя кооператива по программе "Благорост" представляет собой последовательность шагов, где каждый шаг - это утверждение определенного документа советом кооператива.

### Как работает система:

1. **Председатель** отправляет документ на рассмотрение совета через интерфейс онбординга
2. **Система** создает проект свободного решения с вопросом в повестке заседания совета
3. **Совет** голосует по вопросу и принимает решение
4. **Система отслеживания решений** автоматически отмечает шаг онбординга как завершенный
5. **Интерфейс** обновляется, показывая завершенный шаг

### Архитектура:

- **Frontend**: Vue.js компонент `CapitalOnboardingCard.vue` отображает список шагов
- **Backend**: NestJS сервисы обрабатывают создание решений и отслеживание их принятия
- **Database**: Конфигурация расширения `capital` хранит состояние онбординга
- **Blockchain**: Решения совета записываются в блокчейн
- **Factory**: Генерирует документы на основе шаблонов

## Шаги добавления нового документа в онбординг

### 1. Создание документа в Factory

#### 1.1 Создать Action (src/Actions/{registry_id}.{DocumentName}.ts)
```typescript
import { DraftContract } from 'cooptypes'
import { DocumentName } from '../Templates'
import { DocFactory } from '../Factory'
import type { IGeneratedDocument, IGenerationOptions, IMetaDocument, ITemplate } from '../Interfaces'
import type { MongoDBConnector } from '../Services/Databazor'

export { DocumentName as Template } from '../Templates'

export class Factory extends DocFactory<DocumentName.Action> {
  constructor(storage: MongoDBConnector) {
    super(storage)
  }

  async generateDocument(data: DocumentName.Action, options?: IGenerationOptions): Promise<IGeneratedDocument> {
    let template: ITemplate<DocumentName.Model>

    if (process.env.SOURCE === 'local') {
      template = DocumentName.Template
    } else {
      template = await this.getTemplate(DraftContract.contractName.production, DocumentName.registry_id, data.block_num)
    }

    const meta: IMetaDocument = await this.getMeta({ title: template.title, ...data })
    const vars = await this.getVars(data.coopname)
    const coop = await this.getCooperative(data.coopname)

    const combinedData: DocumentName.Model = {
      meta,
      coop,
      vars,
    }

    await this.validate(combinedData, template.model)

    const translation = template.translations[meta.lang]
    const document: IGeneratedDocument = await this.generatePDF('', template.context, combinedData, translation, meta, options?.skip_save)

    return document
  }
}
```

#### 1.2 Создать Template (src/Templates/{registry_id}.{DocumentName}.ts)
```typescript
import type { JSONSchemaType } from 'ajv'
import { Cooperative } from 'cooptypes'
import type { ITemplate } from '../Interfaces'
import { IMetaJSONSchema } from '../Schema/MetaSchema'
import { CommonUserSchema, CooperativeSchema, VarsSchema } from '../Schema'

export const registry_id = Cooperative.Registry.DocumentName.registry_id

// Модель действия для генерации
export type Action = Cooperative.Registry.DocumentName.Action

// Модель данных
export type Model = Cooperative.Registry.DocumentName.Model

// Схема для сверки
export const Schema: JSONSchemaType<Model> = {
  type: 'object',
  properties: {
    meta: IMetaJSONSchema,
    coop: CooperativeSchema,
    vars: VarsSchema,
  },
  required: ['meta', 'coop', 'vars'],
  additionalProperties: true,
}

export const Template: ITemplate<Model> = {
  title: Cooperative.Registry.DocumentName.title,
  description: Cooperative.Registry.DocumentName.description,
  model: Schema,
  context: Cooperative.Registry.DocumentName.context,
  translations: Cooperative.Registry.DocumentName.translations,
}
```

#### 1.3 Добавить экспорт в src/Actions/index.ts
```typescript
export * as DocumentName from './{registry_id}.DocumentName'
```

### 2. Создание документа в CoopTypes

#### 2.1 Создать определение в cooperative/registry/{registry_id}.{DocumentName}/index.ts
```typescript
import type { IGenerate, IMetaDocument } from '../../document'
import type { ICommonUser, ICooperativeData, IVars } from '../../model'

export const registry_id = {registry_id}

// Модель действия для генерации
export interface Action extends IGenerate {
  registry_id: number
}

export type Meta = IMetaDocument & Action

// Модель данных документа
export interface Model {
  meta: IMetaDocument
  coop: ICooperativeData
  vars: IVars
}

export const title = 'Название документа'
export const description = 'Описание документа'
export const context = `<div class="digital-document"><!-- HTML контент --></div>`
export const translations = {
  ru: {
    // переводы
  },
}
```

#### 2.2 Добавить в cooperative/registry/index.ts
```typescript
export * as DocumentName from './{registry_id}.DocumentName'
```

### 3. Обновление Frontend

#### 3.1 Обновить composable.ts (desktop/extensions/capital/features/Onboarding/model/composable.ts)
```typescript
// Добавить в stepToRegistryId
const stepToRegistryId: Record<string, number> = {
  'document_name': {registry_id},
  // ... остальные
};

// Добавить шаг в stepsConfig (в нужной позиции)
{
  id: 'document_name',
  title: 'Название документа для отображения',
  description: 'Описание что делает этот шаг',
  question: 'Вопрос для повестки совета',
  decision: '',
  decisionPrefix: 'Утвердить документ:',
  status: state?.document_name_done ? 'completed' :
          state?.onboarding_document_name_hash ? 'in_progress' : 'pending',
  hash: typeof state?.onboarding_document_name_hash === 'string' && state.onboarding_document_name_hash ? state.onboarding_document_name_hash : null,
  // depends_on: ['other_step'] // если есть зависимости
},
```

### 4. Обновление Backend DTO

#### 4.1 Обновить enum в onboarding.dto.ts
```typescript
export enum CapitalOnboardingStepEnum {
  document_name = 'document_name',
  // ... остальные
}
```

#### 4.2 Добавить поля в CapitalOnboardingStateDTO
```typescript
@Field(() => Boolean)
document_name_done!: boolean;

@Field(() => String, { nullable: true })
onboarding_document_name_hash?: string | null;
```

### 5. Обновление Backend Service

#### 5.1 Обновить типы в onboarding.service.ts
```typescript
type OnboardingFlagKey =
  | 'onboarding_document_name_done'
  | // ... остальные

type OnboardingHashKey =
  | 'onboarding_document_name_hash'
  | // ... остальные
```

#### 5.2 Обновить методы маппинга
```typescript
private mapStepToFlag(step: CapitalOnboardingStepEnum): OnboardingFlagKey {
  switch (step) {
    case CapitalOnboardingStepEnum.document_name:
      return 'onboarding_document_name_done';
    // ... остальные
  }
}

private mapStepToHash(step: CapitalOnboardingStepEnum): OnboardingHashKey {
  switch (step) {
    case CapitalOnboardingStepEnum.document_name:
      return 'onboarding_document_name_hash';
    // ... остальные
  }
}

private mapStepToVarsField(step: CapitalOnboardingStepEnum): string {
  switch (step) {
    case CapitalOnboardingStepEnum.document_name:
      return 'document_name';
    // ... остальные
  }
}
```

#### 5.3 Обновить buildState метод
```typescript
private buildState(pluginConfig: IConfig & Record<string, any>): CapitalOnboardingStateDTO {
  return {
    document_name_done: !!pluginConfig.onboarding_document_name_done,
    onboarding_document_name_hash: pluginConfig.onboarding_document_name_hash || null,
    // ... остальные поля
  };
}
```

### 6. Обновление GraphQL Schema

#### 6.1 Добавить шаг в enum CapitalOnboardingStep
```graphql
enum CapitalOnboardingStep {
  document_name
  # ... остальные
}
```

#### 6.2 Добавить поля в type CapitalOnboardingState
```graphql
type CapitalOnboardingState {
  document_name_done: Boolean!
  onboarding_document_name_hash: String
  # ... остальные поля
}
```

### 7. Обновление SDK

#### 7.1 Обновить selectors/capital/onboardingStateSelector.ts
```typescript
const onboardingStateFields = {
  document_name_done: true,
  onboarding_document_name_hash: true,
  // ... остальные
} as const
```

### 8. Обновление сервиса обработки событий

#### 8.1 Обновить CapitalOnboardingEventsService
```typescript
private mapStepToFlag(step: string): keyof IConfig | null {
  const mapping: Record<string, keyof IConfig> = {
    document_name: 'onboarding_document_name_done',
    // ... остальные
  };

  return mapping[step] || null;
}
```

### 9. Обновление конфигурации расширения

#### 9.1 Добавить поля в defaultConfig (capital-extension.module.ts)
```typescript
export const defaultConfig = {
  // ... другие поля

  // Онбординг флаги
  onboarding_document_name_done: false,
  // ... остальные onboarding флаги
} as const;
```

#### 9.2 Добавить поля в Zod-схему (capital-extension.module.ts)
```typescript
// Онбординг флаги
onboarding_document_name_done: z
  .boolean()
  .default(defaultConfig.onboarding_document_name_done)
  .describe(describeField({ label: 'Описание шага онбординга', visible: false })),
// ... остальные onboarding поля
```

**Примечание:** Hash поля (`onboarding_document_name_hash`) не нужно добавлять в конфигурацию, так как они используются опционально и инициализируются как `null` по умолчанию.

## Проверка работы

1. **Проверить отсутствие ошибок TypeScript** в файлах:
   - `capital-extension.module.ts`
   - `onboarding-events.service.ts`
   - Других обновленных файлах

2. Перезапустить сервер
3. Открыть интерфейс онбординга
4. Проверить что новый документ появился в списке
5. Отправить документ на рассмотрение совета
6. Проверить логи на наличие предупреждений о неизвестном шаге
7. Принять решение советом
8. Проверить что шаг отмечен как завершенный

## Возможные проблемы

1. **"Неизвестный шаг онбординга"** - проверить маппинг в CapitalOnboardingEventsService
2. **Документ не генерируется** - проверить Action и Template в Factory
3. **Шаг не отображается** - проверить composable.ts на фронтенде
4. **GraphQL ошибки** - проверить схему и DTO

## Полезные команды

```bash
# Проверить логи контроллера
tail -f logs/controller.log

# Перезапустить сервисы
pnpm restart:controller
pnpm restart:desktop
```