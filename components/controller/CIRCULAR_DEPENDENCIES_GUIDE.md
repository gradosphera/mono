# 🔄 Руководство по работе с циклическими зависимостями в NestJS

## 📋 Содержание
1. [Понимание проблемы](#понимание-проблемы)
2. [Золотые правила](#золотые-правила)
3. [Стратегии предотвращения](#стратегии-предотвращения)
4. [Быстрая диагностика](#быстрая-диагностика)
5. [Продвинутые инструменты отладки](#продвинутые-инструменты-отладки)
6. [Решение проблем](#решение-проблем)
7. [Архитектурные паттерны](#архитектурные-паттерны)

---

## 🎯 Понимание проблемы

### Что такое циклическая зависимость?
Циклическая зависимость возникает, когда модуль A зависит от модуля B, а модуль B зависит от модуля A (прямо или через цепочку других модулей).

```
❌ ПЛОХО:
ModuleA imports ModuleB
ModuleB imports ModuleA
```

### Почему порядок импортов НЕ важен?
NestJS строит **граф зависимостей** до инициализации. Порядок строк в `imports: []` не влияет на порядок инициализации модулей!

---

## 🏆 Золотые правила

### Правило 1: Минимизируйте глобальные модули
**@Global() модули — это БОМБА замедленного действия!**

```typescript
// ❌ ОПАСНО
@Global()
@Module({
  imports: [SomeOtherModule],  // Этот импорт применится везде!
  providers: [SomeService],
})
export class MyGlobalModule {}

// ✅ БЕЗОПАСНО
@Module({
  providers: [SomeService],
  exports: [SomeService],
})
export class MyModule {}
```

**Когда использовать @Global():**
- ✅ Инфраструктурные модули (Database, Redis, Logger)
- ✅ Модули без imports (только providers)
- ✅ Сервисы-утилиты без зависимостей от domain-модулей
- ❌ Domain модули с бизнес-логикой
- ❌ Модули, которые импортируют другие domain-модули

### Правило 2: Глобальный модуль НЕ должен импортировать НЕ-глобальные модули
```typescript
// ❌ ОПАСНО - приведёт к циклам
@Global()
@Module({
  imports: [DocumentDomainModule],  // Не-глобальный!
})
export class BlockchainModule {}

// ✅ ПРАВИЛЬНО - используем forwardRef или делаем оба глобальными
@Global()
@Module({
  imports: [forwardRef(() => DocumentDomainModule)],
})
export class BlockchainModule {}
```

### Правило 3: Один провайдер — один модуль
Не создавайте отдельные модули для одного сервиса внутри той же папки.

```typescript
// ❌ ПЛОХО - создаёт запутанность
// domain/document/document.module.ts
// domain/document/document-validation.module.ts  <- лишний!

// ✅ ХОРОШО - всё в одном модуле
@Module({
  providers: [
    DocumentService,
    DocumentValidationService,  // Просто добавляем в тот же модуль
  ],
  exports: [DocumentService, DocumentValidationService],
})
export class DocumentDomainModule {}
```

### Правило 4: forwardRef — это норма для domain-модулей
**НЕ БОЙТЕСЬ использовать forwardRef!** Это стандартный способ работы с взаимозависимыми модулями.

```typescript
// ✅ ВСЕГДА используйте forwardRef для модулей, которые могут импортировать друг друга
@Module({
  imports: [
    forwardRef(() => AccountDomainModule),
    forwardRef(() => DocumentDomainModule),
  ],
})
export class ParticipantDomainModule {}
```

---

## 🛡️ Стратегии предотвращения

### Стратегия 1: Правило трёх уровней
Организуйте зависимости по уровням:

```
Уровень 1 (Infrastructure - GLOBAL)
  ↓
Уровень 2 (Domain - LOCAL with forwardRef)
  ↓
Уровень 3 (Application - LOCAL)
```

**Правила:**
- Уровень 1 НЕ импортирует уровни 2 и 3
- Уровень 2 может импортировать уровень 1 (без forwardRef)
- Уровень 2 импортирует другие модули уровня 2 через forwardRef
- Уровень 3 импортирует уровни 1 и 2 (может без forwardRef)

### Стратегия 2: Создавайте модули-агрегаторы
Вместо прямых зависимостей между domain-модулями:

```typescript
// ✅ Создайте специальный модуль-интерфейс
@Module({
  providers: [ConfigurationService],  // Без зависимостей
  exports: [ConfigurationService],
})
export class SharedConfigModule {}

// Используйте его везде
@Module({
  imports: [SharedConfigModule],  // Нет циклов!
})
export class ModuleA {}

@Module({
  imports: [SharedConfigModule],  // Нет циклов!
})
export class ModuleB {}
```

### Стратегия 3: Выносите конфигурацию в отдельные модули
```typescript
// ✅ ХОРОШО - конфигурация отдельно
@Global()
@Module({
  providers: [AgreementConfigService],  // Только данные, без логики
  exports: [AgreementConfigService],
})
export class AgreementConfigModule {}

// Логика импортирует конфигурацию
@Module({
  imports: [forwardRef(() => DocumentDomainModule)],
  // AgreementConfigModule не нужно импортировать - он глобальный
})
export class RegistrationDomainModule {}
```

---

## 🔍 Быстрая диагностика

### Чек-лист при ошибке "Circular dependency inside XXXModule"

1. **Найдите все @Global() модули:**
```bash
grep -r "@Global()" src/domain --include="*.ts"
```

2. **Проверьте их imports:**
```typescript
// Для каждого @Global() модуля проверьте:
// - Импортирует ли он НЕ-глобальные модули?
// - Используется ли forwardRef?
```

3. **Постройте граф зависимостей на бумаге:**
```
[Global] BlockchainModule
  └→ imports: [RegistrationDomainModule]
       └→ imports: [DocumentDomainModule]
            └→ imports: [UserCertificateModule]

ParticipantDomainModule
  └→ imports: [DocumentDomainModule]  ❌ КОНФЛИКТ!
```

4. **Найдите общий модуль:**
- Если два разных модуля импортируют один и тот же модуль
- И один из них глобальный — это проблема!

### Инструменты диагностики

```bash
# Найти все модули, которые импортируют конкретный модуль
grep -r "DocumentDomainModule" src --include="*.module.ts"

# Найти все глобальные модули
grep -r "@Global()" src --include="*.module.ts" -A 5

# Найти все использования forwardRef в модулях
grep -r "forwardRef" src --include="*.module.ts"
```

---

## 🔬 Продвинутые инструменты отладки

### Проблема: NestJS не показывает реальную причину

**Типичная ситуация:**
```
Error: A circular dependency has been detected inside DocumentDomainModule
```

Но реальная проблема может быть в:
- `BlockchainModule` импортирует `RegistrationDomainModule`
- `RegistrationDomainModule` импортирует `DocumentDomainModule`
- `ParticipantDomainModule` тоже импортирует `DocumentDomainModule`
- Конфликт! Но NestJS говорит только про "DocumentDomainModule"

### Решение 1: Включить debug-режим NestJS

В `main.ts` или `index.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],  // Добавь 'debug' и 'verbose'
    abortOnError: false,  // Не падать сразу, показать больше информации
  });

  await app.listen(3000);
}
bootstrap();
```

### Решение 2: Создать скрипт анализа модулей

Создай файл `scripts/analyze-modules.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface ModuleInfo {
  name: string;
  path: string;
  isGlobal: boolean;
  imports: string[];
  providers: string[];
}

function analyzeModule(filePath: string): ModuleInfo | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.ts');

  // Проверяем, это модуль?
  if (!content.includes('@Module(')) return null;

  const isGlobal = content.includes('@Global()');

  // Извлекаем imports
  const importsMatch = content.match(/imports:\s*\[([\s\S]*?)\]/);
  const imports: string[] = [];
  if (importsMatch) {
    const importsText = importsMatch[1];
    const moduleMatches = importsText.matchAll(/(\w+Module)/g);
    for (const match of moduleMatches) {
      imports.push(match[1]);
    }
  }

  // Извлекаем providers
  const providersMatch = content.match(/providers:\s*\[([\s\S]*?)\]/);
  const providers: string[] = [];
  if (providersMatch) {
    const providersText = providersMatch[1];
    const providerMatches = providersText.matchAll(/(\w+(?:Service|Adapter|Interactor))/g);
    for (const match of providerMatches) {
      providers.push(match[1]);
    }
  }

  return {
    name: fileName,
    path: filePath,
    isGlobal,
    imports,
    providers,
  };
}

function findAllModules(dir: string): ModuleInfo[] {
  const modules: ModuleInfo[] = [];

  function traverse(currentPath: string) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (file.endsWith('.module.ts')) {
        const moduleInfo = analyzeModule(fullPath);
        if (moduleInfo) {
          modules.push(moduleInfo);
        }
      }
    }
  }

  traverse(dir);
  return modules;
}

function buildDependencyGraph(modules: ModuleInfo[]): string {
  let graph = '# Dependency Graph\n\n';

  // Сначала глобальные модули
  graph += '## Global Modules\n\n';
  const globalModules = modules.filter(m => m.isGlobal);
  for (const mod of globalModules) {
    graph += `### ${mod.name}\n`;
    graph += `**Path:** \`${mod.path}\`\n`;
    if (mod.imports.length > 0) {
      graph += `**Imports:**\n`;
      for (const imp of mod.imports) {
        const imported = modules.find(m => m.name === imp);
        const isGlobalImport = imported?.isGlobal ? '🌍' : '📦';
        graph += `  - ${isGlobalImport} ${imp}\n`;
      }
    }
    graph += '\n';
  }

  // Потом обычные модули
  graph += '## Local Modules\n\n';
  const localModules = modules.filter(m => !m.isGlobal);
  for (const mod of localModules) {
    graph += `### ${mod.name}\n`;
    graph += `**Path:** \`${mod.path}\`\n`;
    if (mod.imports.length > 0) {
      graph += `**Imports:**\n`;
      for (const imp of mod.imports) {
        const imported = modules.find(m => m.name === imp);
        const isGlobalImport = imported?.isGlobal ? '🌍' : '📦';
        graph += `  - ${isGlobalImport} ${imp}\n`;
      }
    }
    graph += '\n';
  }

  return graph;
}

function findPotentialCycles(modules: ModuleInfo[]): string {
  let report = '# Potential Circular Dependencies\n\n';

  // Проверяем глобальные модули, импортирующие не-глобальные
  const globalImportingLocal = modules.filter(m => {
    if (!m.isGlobal) return false;
    return m.imports.some(imp => {
      const imported = modules.find(mod => mod.name === imp);
      return imported && !imported.isGlobal;
    });
  });

  if (globalImportingLocal.length > 0) {
    report += '## ⚠️ Global modules importing non-global modules\n\n';
    report += '**This is the most common cause of circular dependencies!**\n\n';
    for (const mod of globalImportingLocal) {
      report += `### ${mod.name} (@Global)\n`;
      const problematicImports = mod.imports.filter(imp => {
        const imported = modules.find(m => m.name === imp);
        return imported && !imported.isGlobal;
      });
      for (const imp of problematicImports) {
        report += `  - ❌ imports ${imp} (not global)\n`;
      }
      report += '\n';
    }
  }

  // Найти модули, которые импортируют один и тот же модуль
  const moduleUsage = new Map<string, string[]>();
  for (const mod of modules) {
    for (const imp of mod.imports) {
      if (!moduleUsage.has(imp)) {
        moduleUsage.set(imp, []);
      }
      moduleUsage.get(imp)!.push(mod.name);
    }
  }

  report += '## 📊 Module Usage Analysis\n\n';
  for (const [moduleName, users] of moduleUsage.entries()) {
    if (users.length > 1) {
      report += `### ${moduleName}\n`;
      report += `**Imported by ${users.length} modules:**\n`;
      for (const user of users) {
        const userModule = modules.find(m => m.name === user);
        const icon = userModule?.isGlobal ? '🌍' : '📦';
        report += `  - ${icon} ${user}\n`;
      }

      // Проверяем, есть ли глобальный модуль среди пользователей
      const hasGlobalUser = users.some(u => {
        const mod = modules.find(m => m.name === u);
        return mod?.isGlobal;
      });

      if (hasGlobalUser) {
        report += `  ⚠️ **WARNING:** This module is used by global module(s)!\n`;
      }
      report += '\n';
    }
  }

  return report;
}

// Запуск анализа
const srcPath = path.join(__dirname, '..', 'src');
const modules = findAllModules(srcPath);

console.log(`Found ${modules.length} modules\n`);

const graph = buildDependencyGraph(modules);
fs.writeFileSync('module-dependency-graph.md', graph);
console.log('✅ Dependency graph saved to module-dependency-graph.md');

const cycles = findPotentialCycles(modules);
fs.writeFileSync('potential-circular-dependencies.md', cycles);
console.log('✅ Potential cycles analysis saved to potential-circular-dependencies.md');
```

**Использование:**

```bash
# Добавь в package.json
"scripts": {
  "analyze:modules": "ts-node scripts/analyze-modules.ts"
}

# Запусти
pnpm analyze:modules
```

**Результат:**
- `module-dependency-graph.md` - полный граф зависимостей
- `potential-circular-dependencies.md` - подозрительные места

### Решение 3: Отладка через комментирование

**Метод исключения - быстрый и эффективный:**

```typescript
// app.module.ts
@Module({
  imports: [
    // Инфраструктура
    DatabaseModule,
    // ... другие

    // Domain - комментируй по одному!
    // AuthDomainModule,
    // AccountDomainModule,
    // DocumentDomainModule,
    // ParticipantDomainModule,  // <- Начни с этого
    RegistrationDomainModule,    // <- Если ошибка пропала - проблема тут!
    // ... остальные
  ],
})
export class AppModule {}
```

**Алгоритм:**
1. Закомментируй все domain-модули
2. Раскомментируй по одному
3. Запускай приложение после каждого раскомментирования
4. Когда ошибка появится - ты нашёл проблемный модуль!
5. Повторяй для `imports` внутри проблемного модуля

### Решение 4: Логгер инициализации модулей

Создай `src/utils/module-init-logger.ts`:

```typescript
import { Logger, Module } from '@nestjs/common';

const logger = new Logger('ModuleInitializer');
const moduleStack: string[] = [];

export function LogModuleInit(moduleName: string) {
  return function (target: any) {
    const originalOnModuleInit = target.prototype.onModuleInit;

    target.prototype.onModuleInit = async function (...args: any[]) {
      moduleStack.push(moduleName);
      logger.log(`▶️  Initializing module: ${moduleName}`);
      logger.debug(`   Module stack: ${moduleStack.join(' → ')}`);

      try {
        if (originalOnModuleInit) {
          await originalOnModuleInit.apply(this, args);
        }
        logger.log(`✅ Module initialized: ${moduleName}`);
      } catch (error) {
        logger.error(`❌ Failed to initialize: ${moduleName}`);
        logger.error(`   Stack at failure: ${moduleStack.join(' → ')}`);
        throw error;
      } finally {
        moduleStack.pop();
      }
    };

    return target;
  };
}
```

**Использование в модулях:**

```typescript
import { LogModuleInit } from '~/utils/module-init-logger';

@LogModuleInit('DocumentDomainModule')
@Module({
  // ...
})
export class DocumentDomainModule implements OnModuleInit {
  onModuleInit() {
    // Будет автоматически залоггировано
  }
}
```

### Решение 5: Визуализация через Mermaid

После запуска скрипта анализа, создай визуализацию:

```bash
# scripts/generate-mermaid.ts
import * as fs from 'fs';

function generateMermaidGraph(modules: ModuleInfo[]): string {
  let mermaid = '```mermaid\ngraph TD\n';

  // Стили
  mermaid += '  classDef global fill:#f96,stroke:#333,stroke-width:4px\n';
  mermaid += '  classDef local fill:#9cf,stroke:#333,stroke-width:2px\n\n';

  // Узлы
  for (const mod of modules) {
    const nodeId = mod.name.replace(/Module$/, '');
    mermaid += `  ${nodeId}[${mod.name}]\n`;
    if (mod.isGlobal) {
      mermaid += `  class ${nodeId} global\n`;
    } else {
      mermaid += `  class ${nodeId} local\n`;
    }
  }

  mermaid += '\n';

  // Связи
  for (const mod of modules) {
    const fromId = mod.name.replace(/Module$/, '');
    for (const imp of mod.imports) {
      const toId = imp.replace(/Module$/, '');
      mermaid += `  ${fromId} --> ${toId}\n`;
    }
  }

  mermaid += '```';
  return mermaid;
}
```

**Результат:** Вставь в README.md или открой в VS Code с расширением Mermaid Preview.

### Решение 6: NestJS Devtools (экспериментально)

```bash
pnpm add @nestjs/devtools-integration
```

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    snapshot: true,  // Включить Devtools
  });
  await app.listen(3000);
}
```

Потом открой: http://localhost:8000 - увидишь граф модулей в реальном времени!

### Практический совет: Комбинируй методы

**Когда появилась ошибка:**

1. **Запусти `pnpm analyze:modules`** - получишь отчёт о потенциальных проблемах
2. **Найди в отчёте** модуль из ошибки (например, DocumentDomainModule)
3. **Посмотри раздел "Module Usage Analysis"** - кто его импортирует?
4. **Проверь раздел "Global modules importing non-global"** - есть ли проблемный модуль там?
5. **Используй метод комментирования** для точной локализации

### Чеклист отладки

```bash
# 1. Включи verbose логи
# в main.ts добавь logger: ['error', 'warn', 'log', 'debug', 'verbose']

# 2. Запусти анализ модулей
pnpm analyze:modules

# 3. Открой potential-circular-dependencies.md
# Найди секцию "Global modules importing non-global modules"

# 4. Если проблема не очевидна - используй комментирование
# Закомментируй модули в app.module.ts по одному

# 5. После нахождения проблемного модуля
# Открой его и проверь imports - есть ли там forwardRef?

# 6. Проверь - не является ли проблемный модуль глобальным?
grep -r "@Global()" src --include="*.ts" | grep "ИмяМодуля"
```

---

## 🔧 Решение проблем

### Сценарий 1: Циклическая зависимость между domain-модулями
**Проблема:** ModuleA и ModuleB импортируют друг друга

**Решение:**
```typescript
// ✅ Используйте forwardRef с ОБЕИХ сторон
@Module({
  imports: [forwardRef(() => ModuleB)],
})
export class ModuleA {}

@Module({
  imports: [forwardRef(() => ModuleA)],
})
export class ModuleB {}
```

### Сценарий 2: Глобальный модуль создаёт цикл
**Проблема:** @Global() модуль импортирует модуль, который используется в других местах

**Решение A - Убрать импорт:**
```typescript
// ❌ БЫЛО
@Global()
@Module({
  imports: [SomeModule],
})
export class GlobalModule {}

// ✅ СТАЛО - сделать SomeModule тоже глобальным
@Global()
@Module({
  imports: [],  // Убрали импорт
})
export class GlobalModule {}

@Global()
@Module({})
export class SomeModule {}  // Теперь его провайдеры доступны везде
```

**Решение B - Использовать forwardRef в инжекции:**
```typescript
// ✅ В адаптере/сервисе используйте forwardRef
@Injectable()
export class MyAdapter {
  constructor(
    @Inject(forwardRef(() => SOME_SERVICE))
    private readonly someService: SomeService
  ) {}
}
```

### Сценарий 3: Создали новый сервис в существующем модуле
**Проблема:** Добавили сервис, который зависит от другого модуля

**Решение - НЕ создавайте новый модуль:**
```typescript
// ❌ ПЛОХО
// Создали domain/document/document-validation.module.ts

// ✅ ХОРОШО - добавьте в существующий
@Module({
  providers: [
    DocumentService,
    DocumentValidationService,  // Просто добавили
  ],
  exports: [DocumentService, DocumentValidationService],
})
export class DocumentDomainModule {}
```

---

## 🏗️ Архитектурные паттерны

### Паттерн 1: Dependency Inversion через интерфейсы
```typescript
// shared/interfaces/document-validator.interface.ts
export interface IDocumentValidator {
  validate(doc: any): Promise<boolean>;
}

export const DOCUMENT_VALIDATOR = Symbol('DOCUMENT_VALIDATOR');

// Реализация в domain/document
@Injectable()
export class DocumentValidationService implements IDocumentValidator {
  async validate(doc: any): Promise<boolean> { /* ... */ }
}

// Используем через интерфейс
@Injectable()
export class SomeService {
  constructor(
    @Inject(DOCUMENT_VALIDATOR)
    private readonly validator: IDocumentValidator  // Зависимость от интерфейса!
  ) {}
}
```

### Паттерн 2: Event-driven для разрыва зависимостей
```typescript
// ✅ Вместо прямого вызова используйте события
@Injectable()
export class UserService {
  constructor(private eventEmitter: EventEmitter2) {}

  async createUser() {
    // ...
    this.eventEmitter.emit('user.created', user);  // Не зависим от DocumentService!
  }
}

@Injectable()
export class DocumentService {
  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    // Создаём документы
  }
}
```

### Паттерн 3: Фасад для сложных зависимостей
```typescript
// ✅ Создайте фасад-модуль
@Module({
  imports: [
    forwardRef(() => ModuleA),
    forwardRef(() => ModuleB),
    forwardRef(() => ModuleC),
  ],
  providers: [FacadeService],
  exports: [FacadeService],
})
export class ComplexOperationsFacadeModule {}

// Теперь другие модули зависят только от фасада
@Module({
  imports: [ComplexOperationsFacadeModule],  // Один импорт вместо трёх!
})
export class SomeModule {}
```

---

## 📊 Быстрая справка по действиям

### При создании нового модуля:
- [ ] Это domain-модуль? → Используй forwardRef для импортов других domain-модулей
- [ ] Это infrastructure-модуль? → Можно сделать @Global, но БЕЗ импортов domain-модулей
- [ ] Нужен только один сервис? → Добавь в существующий модуль, не создавай новый

### При появлении ошибки циклической зависимости:
1. [ ] Найди все @Global() модули и проверь их imports
2. [ ] Найди модуль, указанный в ошибке (XXXModule)
3. [ ] Построй граф: кто его импортирует?
4. [ ] Есть ли глобальный модуль в цепочке?
   - Да → Убери импорт или используй forwardRef в инжекции
   - Нет → Добавь forwardRef в imports модулей
5. [ ] Проверь: может ли сервис быть в другом модуле?

### При рефакторинге:
- [ ] Минимизируй количество @Global() модулей
- [ ] Убери прямые зависимости между domain-модулями
- [ ] Используй события или фасады для сложных взаимодействий
- [ ] Выноси конфигурацию в отдельные глобальные модули

---

## 🎓 Кейс из практики: Проблема с DocumentValidationModule

### Что было:
```typescript
// ❌ ПРОБЛЕМА
DocumentValidationModule (отдельный файл)
  └→ зависит от DOCUMENT_REPOSITORY

ParticipantDomainModule
  ├→ imports: [DocumentDomainModule]
  └→ imports: [DocumentValidationModule]  // Лишний модуль!

BlockchainModule (@Global)
  └→ imports: [RegistrationDomainModule]
       └→ imports: [DocumentDomainModule]  // Конфликт!
```

### Что сделали:
```typescript
// ✅ РЕШЕНИЕ
1. Убрали DocumentValidationModule
2. Добавили DocumentValidationService в DocumentDomainModule
3. Сделали RegistrationDomainModule глобальным
4. Убрали его импорт из BlockchainModule (провайдеры доступны автоматически)
5. Добавили forwardRef в AccountBlockchainAdapter
```

### Результат:
- ✅ Нет лишних модулей
- ✅ Нет конфликтов импортов
- ✅ Код проще и понятнее

---

## 📝 Резюме

### ДА ✅
- Используйте forwardRef для domain-модулей
- Минимизируйте @Global() модули
- Добавляйте сервисы в существующие модули
- Выносите конфигурацию в отдельные глобальные модули
- Стройте графы зависимостей на бумаге

### НЕТ ❌
- Не создавайте отдельный модуль для одного сервиса
- Не импортируйте НЕ-глобальные модули в @Global() модулях (без forwardRef)
- Не полагайтесь на порядок импортов
- Не создавайте глубокие цепочки зависимостей
- Не забывайте про forwardRef между взаимозависимыми модулями

### ПОМНИ 🧠
**Порядок импортов не важен! Важна структура графа зависимостей!**

---

*Документ создан на основе реального опыта решения циклических зависимостей в проекте MonoCoop.*
*Последнее обновление: December 2025*
