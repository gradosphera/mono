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

- [ ] **6.1 Инфраструктура**: Добавить OpenSearch в docker-compose.yaml, обнуление при reboot
- [ ] **6.2 Controller — features system**: Добавить объект `features` в SystemInfo GraphQL (features.search = true/false)
- [ ] **6.3 Controller — индексация**: Сервис автоматической индексации документов из MongoDB коллекции `documents` в OpenSearch
- [ ] **6.4 Controller — поиск**: GraphQL query `searchDocuments(query: String)` с релевантным поиском
- [ ] **6.5 SDK**: Добавить query/selector для searchDocuments
- [ ] **6.6 Desktop — компонент поиска**: Кнопка + модальное окно с поиском, результаты по мере ввода
- [ ] **6.7 Desktop — интеграция**: Кнопка в header + на странице реестра документов
- [ ] **6.8 Тесты**: Unit-тесты для индексации и поиска
- [ ] **6.9 Graceful degradation**: Система работает без OpenSearch (features.search = false)
- [ ] **6.10 Документация**: AGENTS.md обновления, TASKS.md
