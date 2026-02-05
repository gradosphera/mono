# Sprint Plan: Виджет участников проекта

**Date:** 2026-02-04
**Scrum Master:** AI Assistant
**Project Level:** 1
**Total Stories:** 5
**Total Points:** 12
**Planned Sprints:** 2

---

## Executive Summary

План спринта для улучшения виджета участников проекта включает исправление логики отображения участников и добавление информации о вкладах. Проект разделен на 2 спринта по 1 неделе каждый с общим объемом 12 story points.

**Key Metrics:**
- Total Stories: 5
- Total Points: 12
- Sprints: 2 (по 1 неделе)
- Team Capacity: 8 points per sprint
- Target Completion: 2026-02-18

---

## Story Inventory

### STORY-001: Исправить логику создания участников

**Priority:** Must Have

**User Story:**
As a: Пользователь кооператива
I want to: Видеть себя в списке участников сразу после получения доступа к проекту
So that: Я понимаю свой статус участия без необходимости делать вклад

**Acceptance Criteria:**
- [ ] Участник отображается в виджете сразу после подписания соглашения об участии
- [ ] Не требуется делать вклад для отображения в списке участников
- [ ] Логика создания Contributor изменена с "при первом вкладе" на "при подтверждении доступа"

**Technical Notes:**
Изменить условие создания Contributor entity в backend. Добавить проверку статуса appendix вместо проверки наличия вкладов.

**Dependencies:**
Нет

**Points:** 2

### STORY-002: Добавить расчет количества вкладов

**Priority:** Must Have

**User Story:**
As a: Пользователь кооператива
I want to: Видеть количество своих вкладов в проект
So that: Я понимаю свой вклад в развитие проекта

**Acceptance Criteria:**
- [ ] Для каждого участника рассчитывается общее количество вкладов
- [ ] Данные агрегируются из таблицы segments эффективно
- [ ] Расчет не вызывает N+1 запросов к базе данных
- [ ] Поле contributed_total добавлено в Contributor entity

**Technical Notes:**
Создать функцию агрегации данных из segments. Оптимизировать запросы с использованием индексов БД. Добавить поле в Contributor entity.

**Dependencies:**
STORY-001 (нужна правильная логика создания участников)

**Points:** 3

### STORY-003: Обновить GraphQL селектор

**Priority:** Must Have

**User Story:**
As a: Frontend разработчик
I want to: Получать данные о количестве вкладов через GraphQL API
So that: Могу отображать информацию о вкладах в UI

**Acceptance Criteria:**
- [ ] GraphQL query capitalContributors возвращает поле totalContributions
- [ ] Селектор ContributorSelector включает новое поле
- [ ] API корректно агрегирует данные из backend
- [ ] Типизация TypeScript обновлена

**Technical Notes:**
Добавить поле totalContributions в ContributorSelector. Обновить GraphQL schema и resolvers. Протестировать типизацию.

**Dependencies:**
STORY-002 (нужен расчет количества вкладов)

**Points:** 2

### STORY-004: Обновить UI компонент

**Priority:** Must Have

**User Story:**
As a: Пользователь кооператива
I want to: Видеть количество вкладов участников в графической форме
So that: Визуально понимаю вклад каждого участника

**Acceptance Criteria:**
- [ ] ContributorsListWidget отображает количество вкладов
- [ ] Информация представлена в понятной графической форме
- [ ] Дизайн адаптивен для различных устройств
- [ ] Роли участников корректно отображаются

**Technical Notes:**
Обновить ContributorsListWidget.vue для отображения поля totalContributions. Добавить графические элементы (иконки, бейджи). Протестировать адаптивность.

**Dependencies:**
STORY-003 (нужен GraphQL API)

**Points:** 2

### STORY-005: Тестирование новой функциональности

**Priority:** Must Have

**User Story:**
As a: QA инженер
I want to: Убедиться что новая функциональность работает корректно
So that: Уверен в качестве релиза

**Acceptance Criteria:**
- [ ] Интеграционное тестирование всех изменений проведено
- [ ] Существующие функции не нарушены
- [ ] Время загрузки списка участников не превышает 2 секунды
- [ ] Пагинация работает плавно при большом количестве участников
- [ ] Все acceptance criteria из tech-spec выполнены

**Technical Notes:**
Создать интеграционные тесты. Провести ручное тестирование всех сценариев. Замерить производительность. Проверить кросс-браузерную совместимость.

**Dependencies:**
STORY-001, STORY-002, STORY-003, STORY-004 (все изменения должны быть готовы)

**Points:** 3

---

## Sprint Allocation

### Sprint 1 (Неделя 1) - 7/8 points

**Goal:** Реализовать backend изменения для корректного отображения участников и их вкладов

**Stories:**
- STORY-001: Исправить логику создания участников (2 points) - Must Have
- STORY-002: Добавить расчет количества вкладов (3 points) - Must Have
- STORY-003: Обновить GraphQL селектор (2 points) - Must Have

**Total:** 7 points / 8 capacity (88% utilization)

**Risks:**
- Сложности с изменением логики создания участников (mitigation: предварительный анализ кода)

**Dependencies:**
- Доступ к backend инфраструктуре

---

### Sprint 2 (Неделя 2) - 5/8 points

**Goal:** Завершить frontend обновления и протестировать новую функциональность виджета

**Stories:**
- STORY-004: Обновить UI компонент (2 points) - Must Have
- STORY-005: Тестирование новой функциональности (3 points) - Must Have

**Total:** 5 points / 8 capacity (63% utilization)

**Risks:**
- Проблемы с производительностью при большом количестве участников (mitigation: оптимизация запросов)

**Dependencies:**
- Завершенные backend изменения из Sprint 1

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprint |
|---------|-----------|---------|--------------|--------|
| EPIC-001 | Улучшение виджета участников проекта | STORY-001, 002, 003, 004, 005 | 12 points | Sprint 1-2 |

---

## Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | Исправление логики отображения участников | STORY-001 | 1 |
| FR-002 | Добавление поля с количеством вкладов | STORY-002, 003, 004 | 1-2 |
| FR-003 | Интеграция с API для данных о вкладах | STORY-003 | 1 |
| FR-004 | Отображение ролей участников | STORY-004 | 2 |
| FR-005 | Тестирование новой функциональности | STORY-005 | 2 |

---

## Risks and Mitigation

**High:**
- Технические сложности изменения логики создания участников
  - **Likelihood:** Средний
  - **Mitigation:** Предварительный анализ кода, создание плана отката

**Medium:**
- Проблемы с производительностью при расчете вкладов
  - **Likelihood:** Средний
  - **Mitigation:** Оптимизация запросов, использование индексов БД

**Low:**
- Несовместимость с существующей синхронизацией блокчейна
  - **Likelihood:** Низкий
  - **Mitigation:** Тщательное тестирование синхронизации данных

---

## Definition of Done

For a story to be considered complete:
- [ ] Code implemented and committed
- [ ] Unit tests written and passing (≥80% coverage)
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Acceptance criteria validated
- [ ] Non-functional requirements met (performance, security)

---

## Next Steps

**Immediate:** Begin Sprint 1

Run /create-story to create detailed story documents for Sprint 1 stories, or run /dev-story STORY-001 to implement a specific story.

**Sprint cadence:**
- Sprint length: 1 week
- Sprint planning: Monday Week 1
- Sprint review: Friday Week 1
- Sprint retrospective: Friday Week 1

**Recommended:** Start with /dev-story STORY-001 to begin backend changes

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**