# TASKS.md — Прогресс выполнения задач

## Завершённые задачи

### 1. Настройка dev-окружения
- ✅ Node.js 20, pnpm 9, Docker, WeasyPrint
- ✅ docker-compose.yaml с 7 сервисами
- ✅ `pnpm run reboot` — полный перезапуск
- ✅ Вход в систему, подписание документов, рабочий стол председателя

### 2. Security — обновление уязвимых зависимостей
- ✅ mongoose 8→9, jspdf 2→4, jsonwebtoken 8→9 (CRITICAL)
- ✅ express 4.17→4.21, axios, nodemailer, validator, ws, helmet (HIGH)
- ✅ Обновлены desktop, boot, factory

### 3. Unified Test Pipeline — `pnpm run test`
- ✅ test:unit — cooptypes (4) + parser (3) + notifications (7) = 14/14
- ✅ test:component — factory 85/85 с DB-backed моками
- ✅ test:integration — SDK 4/4, boot capital 59/60
- ✅ Итого: 162/163 (99.4%)

### 4. README и описания компонентов
- ✅ 13 README.md на русском для всех компонентов
- ✅ Обновлены description в package.json
- ✅ Корневой README с архитектурой и quick start

### 5. AGENTS.md для всех компонентов
- ✅ controller (~760 строк) — Clean Architecture, 10 расширений
- ✅ desktop (~500 строк) — FSD, 8 workspace-ов, extension system
- ✅ factory, boot, parser, sdk, cooptypes, notifications

### 6. Setup — профессиональный установщик
- ✅ 3 режима: разработка, тестнет, продакшен
- ✅ Генерация .env, сборка библиотек и контрактов

---

## Текущая задача: Поисковая система документов (OpenSearch)

### Подзадачи:

- [x] **6.1 Инфраструктура**: OpenSearch 2.18.0 в docker-compose.yaml, обнуление при reboot
- [x] **6.2 Controller — features system**: Объект `features` в SystemInfo GraphQL (features.search)
- [x] **6.3 Controller — индексация**: OpenSearchService — автоиндексация при генерации документов
- [x] **6.4 Controller — поиск**: GraphQL query `searchDocuments` с full-text search и highlights
- [x] **6.5 SDK**: searchDocuments query + features selector в SystemInfo
- [x] **6.6 Desktop — компонент поиска**: DocumentSearchDialog (модалка) + SearchButton
- [x] **6.7 Desktop — интеграция**: SearchButton в header + UserDocumentsPage
- [x] **6.9 Graceful degradation**: features.search=false скрывает UI, OpenSearchService возвращает []
- [x] **6.8 Визуальное тестирование**: Поиск "кошелёк" → 1 результат с подсветкой, "соглашение" → 4 результата с fuzzy matching
- [x] **6.10 OpenSearch 2.18.0 с паролем**: Security enabled, auth + SSL
- [x] **6.11 Индексация по blockchain event**: newsubmitted вместо генерации

---

## Текущая задача: Процессы в расширении Capital

### Описание
Процесс — часть компонента, только в БД (не блокчейн). Собирает задачи в циклы. 
При выполнении стартовой задачи создаются последующие. Визуальный интерфейс через Vue Flow.

### Подзадачи:

- [ ] **7.1 Модель данных**: TypeORM entities — Process, ProcessStep, ProcessInstance, ProcessTask
- [ ] **7.2 Controller — CRUD**: GraphQL mutations/queries для процессов и шаблонов
- [ ] **7.3 Controller — логика исполнения**: Создание задач при старте, отслеживание завершения
- [ ] **7.4 SDK**: Queries и Mutations для процессов
- [ ] **7.5 Desktop — страница "Процессы"**: Sidebar + Vue Flow визуализация
- [ ] **7.6 Desktop — создание шаблона**: Drag-and-drop конструктор шагов
- [ ] **7.7 Desktop — режим исполнения**: Запуск процесса, статус задач
- [ ] **7.8 Права доступа**: chairman/member → проектирование, user → исполнение
- [ ] **7.9 Тесты + документация**
