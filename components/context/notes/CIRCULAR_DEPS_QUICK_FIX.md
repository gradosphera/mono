# 🚨 Быстрое исправление циклических зависимостей

## Увидел ошибку? Действуй!

```
Error: A circular dependency has been detected inside DocumentDomainModule
```

### Шаг 1: Запусти анализ (30 секунд)

```bash
pnpm analyze:modules
```

Откроются 2 файла:
- `potential-circular-dependencies.md` - **НАЧНИ С ЭТОГО!**
- `module-dependency-graph.md` - полный граф

### Шаг 2: Найди проблему в отчёте

Открой `potential-circular-dependencies.md` и ищи:

#### A) Секция "CRITICAL: Global modules importing non-global"
```md
### ❌ BlockchainModule (@Global)
**Problematic imports:**
  - ❌ RegistrationDomainModule (not global)  👈 ВОТ ОНО!
```

**Решение:**
```typescript
// Вариант 1: Убери импорт
@Global()
@Module({
  imports: [],  // Убрал RegistrationDomainModule
})
export class BlockchainModule {}

// Вариант 2: Сделай импортируемый модуль тоже глобальным
@Global()  // Добавил
@Module({...})
export class RegistrationDomainModule {}
```

#### B) Секция "Highly Coupled Modules"
```md
### DocumentDomainModule 📦
⚠️ WARNING: Non-global module used by global module(s)!  👈 ПРОБЛЕМА!
```

**Решение:**
```typescript
// В глобальном модуле используй forwardRef
@Global()
@Module({
  imports: [forwardRef(() => DocumentDomainModule)],
})
```

### Шаг 3: Если анализ не помог - метод комментирования

**В `app.module.ts`:**

```typescript
@Module({
  imports: [
    // Инфраструктура
    DatabaseModule,
    RedisModule,

    // Domain - КОММЕНТИРУЙ ПО ОДНОМУ!
    // AuthDomainModule,
    // AccountDomainModule,
    RegistrationDomainModule,  // 👈 Раскомментируй это
    // DocumentDomainModule,     // 👈 Потом это
    // ParticipantDomainModule,  // 👈 Потом это
  ],
})
```

**Алгоритм:**
1. Закомментируй ВСЕ domain-модули
2. Раскомментируй по одному
3. После каждого раскомментирования запускай: `pnpm dev`
4. Когда ошибка появится → ты нашёл виновника!

### Шаг 4: Применяй стандартные решения

#### Решение 1: forwardRef в imports
```typescript
@Module({
  imports: [
    forwardRef(() => AccountDomainModule),
    forwardRef(() => DocumentDomainModule),
  ],
})
export class ParticipantDomainModule {}
```

#### Решение 2: forwardRef в инжекции
```typescript
@Injectable()
export class MyService {
  constructor(
    @Inject(forwardRef(() => SOME_SERVICE))
    private readonly someService: SomeService
  ) {}
}
```

#### Решение 3: Убрать лишний модуль
```typescript
// ❌ БЫЛО два модуля
// document/document.module.ts
// document/document-validation.module.ts

// ✅ СТАЛО один модуль
@Module({
  providers: [
    DocumentService,
    DocumentValidationService,  // Просто добавили сюда
  ],
})
export class DocumentDomainModule {}
```

## 🎯 Чеклист: Что НЕ делать

- ❌ Не меняй порядок импортов (не поможет!)
- ❌ Не делай модуль глобальным без необходимости
- ❌ Не создавай отдельный модуль для одного сервиса
- ❌ Не импортируй не-глобальные модули в глобальные (без forwardRef)

## 🎯 Чеклист: Что делать

- ✅ Используй `pnpm analyze:modules` ПЕРВЫМ делом
- ✅ Используй forwardRef для domain-модулей
- ✅ Проверь, не является ли проблемный модуль глобальным
- ✅ Используй метод комментирования для точной локализации

## 📚 Подробности

См. полное руководство: `CIRCULAR_DEPENDENCIES_GUIDE.md`

---

*Сохрани этот файл в закладки - он спасёт тебя часы отладки!*
