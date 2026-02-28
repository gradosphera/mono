# TASKS.md — Прогресс выполнения задач

## Завершённые задачи

### 1-6. Предыдущие задачи (см. git history)
- ✅ Dev-окружение, Security, Тесты, README, AGENTS.md, Setup
- ✅ Поисковая система документов (OpenSearch)
- ✅ Процессы (Capital extension)

---

## Текущая задача: Генерация отчётов ФНС (расширение reports)

### Документы ФНС для генерации:
1. **6-НДФЛ** — ежеквартально (XSD: NO_NDFL6.2)
2. **4-ФСС (ЕФС-1)** — ежеквартально  
3. **РСВ** — ежеквартально (XSD: NO_RASCHSV)
4. **ПСВ** — ежемесячно (XSD: NO_PERSSVFL)
5. **Бухгалтерский баланс** — ежегодно (XSD: NO_BUHOTCH) — КЛЮЧЕВОЙ
6. **ДУСН** — декларация УСН ежегодно (XSD: NO_USN)
7. **Уведомление о страховых взносах** — ежемесячно с 2026 (XSD: UT_UVISCHSUMNAL)
8. **УУСН** — уведомление УСН
### 10. Генерация отчётов ФНС (доработка) ✅
- [x] Фабрика генераторов (ReportRegistryService)
- [x] 8 генераторов (Бухбаланс, 6-НДФЛ, РСВ, ПСВ, ДУСН, 4-ФСС, Увед. взносы, УУСН)
- [x] GraphQL API (getAvailableReports, generateReport)
- [x] Генераторы переписаны по XSD — структура соответствует схемам ФНС
- [x] 48 unit-тестов для всех генераторов
- [x] Desktop UI (страница отчётов) — расширение reports
- [x] Интеграция с реальными данными ledger через LedgerInteractor
- [x] OrganizationDataInput DTO для передачи данных организации

### Архитектура:
- Расширение `reports` в `components/controller/src/extensions/`
- Фабрика XML отчётов: на вход данные за период → на выходе XML
- Валидация по XSD схемам
- Desktop UI: магазин приложений → установка → рабочий стол отчётов

### Подзадачи:

- [x] **8.1 Исследование**: Все XSD разобраны, format.nalog.ru изучен
- [x] **8.2 Инфраструктура**: Расширение reports, ReportRegistryService (фабрика)
- [x] **8.3 XML генератор**: Фабричный подход — IReportGenerator interface
- [x] **8.4 Бухбаланс**: BuhotchGenerator — счета 51, 80, 86 из ledger
- [x] **8.5 6-НДФЛ**: Ndfl6Generator — нулевая
- [x] **8.6 4-ФСС**: Zero generator — нулевая
- [x] **8.7 РСВ**: Zero generator — нулевая
- [x] **8.8 ПСВ**: Zero generator — нулевая
- [x] **8.9 ДУСН**: Zero generator — нулевая
- [x] **8.10 Уведомление о взносах**: Zero generator — нулевая
- [x] **8.11 УУСН**: Zero generator — нулевая
- [x] **8.12 GraphQL API**: getAvailableReports + generateReport
- [ ] **8.13 XSD валидация + тесты**: Проверка по схемам
- [ ] **8.14 Desktop UI**: Страница отчётов в магазине приложений
- [ ] **8.15 Ledger интеграция**: Реальные данные из ledger_operations
