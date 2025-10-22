# Система учёта времени (Time Tracking) в CAPITAL расширении

## Общее описание

Система учёта времени предназначена для автоматического отслеживания рабочего времени участников в проектах кооператива. Основная идея заключается в том, что участники получают "пассивный доход" времени за активные задачи, которые они ведут в проектах.

### Основные принципы работы

1. **Автоматический учёт**: Система работает по крону каждый час и автоматически начисляет время участникам за активные задачи (IN_PROGRESS)
2. **Индивидуальные лимиты**: Каждый участник имеет индивидуальный лимит часов в день (поле `hours_per_day`), по умолчанию 0 часов
3. **Равномерное распределение**: Если у участника несколько активных задач, общее доступное время (согласно индивидуальному лимиту) распределяется между ними поровну
4. **Условная доступность**: Время становится доступным для фиксации в коммит только после завершения соответствующих задач (DONE статус)

## Архитектура системы

### Основные компоненты

1. **TimeTrackingInteractor** - основной бизнес-логика учёта времени, включая расчёт available/pending часов
2. **TimeTrackingService** - сервис для обработки запросов от резолверов
3. **TimeTrackingSchedulerService** - планировщик cron задач
4. **Репозитории** - доступ к данным (TimeEntry, Project, Contributor, Issue) - только базовые CRUD операции

### Сущности данных

#### TimeEntry (Запись времени)
```typescript
{
  _id: string,
  contributor_hash: string,    // Хеш участника
  issue_hash: string,          // Хеш задачи
  project_hash: string,        // Хеш проекта
  coopname: string,            // Название кооператива
  date: string,                // Дата в формате YYYY-MM-DD
  hours: number,               // Количество часов
  commit_hash?: string,        // Хеш коммита (если зафиксировано)
  is_committed: boolean,       // Зафиксировано ли время
  block_num: number,           // Номер блока
  present: boolean,            // Активна ли запись
  status: string,              // Статус записи
  _created_at: Date,           // Дата создания
  _updated_at: Date            // Дата обновления
}
```

## Логика учёта времени

### Cron-задача (каждый час)

```typescript
// Запускается каждый час по cron выражению '0 * * * *'
async trackTime(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Получаем всех активных участников из всех кооперативов
  const activeContributors = await this.getAllActiveContributors();

  // Обрабатываем каждого участника
  for (const contributor of activeContributors) {
    await this.trackTimeForContributor(contributor, today);
  }
}
```

### Обработка участника

```typescript
private async trackTimeForContributor(contributor, date): Promise<void> {
  // 1. Получаем активные задачи участника
  const activeIssues = await this.getContributorActiveIssues(contributor);

  // 2. Рассчитываем распределение времени
  const hoursPerIssue = await this.calculateTimeDistributionPerIssue(contributor, activeIssues, date);

  // 3. Создаём/обновляем записи времени для каждой задачи
  for (const issue of activeIssues) {
    const hours = hoursPerIssue[issue.issue_hash] || 0;
    // Создаём или обновляем TimeEntry запись
  }
}
```

### Распределение времени между задачами

```typescript
private async calculateTimeDistributionPerIssue(contributor, activeIssues, date) {
  const HOURS_PER_DAY = contributor.hours_per_day || 0; // Индивидуальный лимит часов или 0 по умолчанию
  const HOURS_PER_HOUR = 1;       // Добавляем каждый час

  // Проверяем уже отработанное время за сегодня
  const existingEntries = await this.timeEntryRepository.findByContributorAndDate(contributor_hash, date);
  const totalExistingHours = existingEntries.reduce((sum, entry) => sum + entry.hours, 0);

  // Если уже отработан лимит часов - выходим
  if (totalExistingHours >= HOURS_PER_DAY) {
    return {};
  }

  // Распределяем доступное время равномерно между задачами
  const availableHours = HOURS_PER_DAY - totalExistingHours;
  const hoursToDistribute = Math.min(HOURS_PER_HOUR, availableHours);
  const hoursPerIssue = hoursToDistribute / activeIssues.length;

  // Возвращаем распределение: { issue_hash: hours }
  return { [issue_hash]: hoursPerIssue, ... };
}
```

### Примеры распределения времени

#### Сценарий 1: 1 активная задача (лимита 8 часов)
- Участник имеет 1 активную задачу
- Каждый час начисляется 1 час на эту задачу
- Максимум 8 часов в день

#### Сценарий 2: 2 активные задачи (лимита 8 часов)
- Участник имеет 2 активные задачи
- Каждый час начисляется по 0.5 часа на каждую задачу
- Максимум 4 часа на задачу в день (8/2)

#### Сценарий 3: 4 активные задачи (лимита 8 часов)
- Участник имеет 4 активные задачи
- Каждый час начисляется по 0.25 часа на каждую задачу
- Максимум 2 часа на задачу в день (8/4)

#### Сценарий 4: Участник с индивидуальным лимитом 6 часов
- Участник имеет 2 активные задачи, лимит 6 часов в день
- Каждый час начисляется по 0.5 часа на каждую задачу
- Максимум 3 часа на задачу в день (6/2)

## Новая логика доступности времени

### Изменения в системе

**До изменений:**
- Время начислялось за активные задачи (IN_PROGRESS)
- Любое начисленное время было доступно для коммита

**После изменений:**
- Время начисляется за активные задачи (IN_PROGRESS)
- Для коммита доступно **только время по завершённым задачам** (DONE)
- Добавлено понятие **pending_hours** - время по незавершённым задачам

### Примеры сценариев

#### Сценарий 1: Участник работает над задачей, но не завершает её
- Участник имеет активную задачу IN_PROGRESS
- Каждый час начисляется 1 час в pending_hours
- available_hours = 0 (нет завершённых задач)
- total_uncommitted_hours = pending_hours

#### Сценарий 2: Участник завершает задачу
- Участник работает над задачей IN_PROGRESS (начисляется время в pending_hours)
- Переводит задачу в DONE
- Время перемещается из pending_hours в available_hours
- Теперь время доступно для коммита

#### Сценарий 3: Смешанный сценарий
- Участник имеет 2 активные задачи IN_PROGRESS (начисляется по 0.5 часа на каждую в pending_hours)
- Завершает одну задачу (DONE)
- Время по завершённой задаче перемещается в available_hours
- available_hours = 4 часа, pending_hours = 4 часа (по второй задаче)
- total_uncommitted_hours = 8 часов

## Активные задачи участника

Задача считается активной, если:
- Статус = `IssueStatus.IN_PROGRESS`
- Участник является создателем задачи (`creator_hash` содержит хеш участника)

```typescript
private async getContributorActiveIssues(contributor): Promise<any[]> {
  return await this.issueRepository.findByStatusAndCreatorsHashs(
    IssueStatus.IN_PROGRESS,
    [contributor.contributor_hash]
  );
}
```

## Коммиты времени

### Фиксация времени в коммит

Когда участник делает коммит в проект, можно зафиксировать часть незакоммиченного времени, но **только по завершённым задачам** (статус DONE):

```typescript
async commitTime(contributorHash, projectHash, hours, commitHash): Promise<void> {
  // Получаем незакоммиченные записи для проекта
  const uncommittedEntries = await this.timeEntryRepository.findUncommittedByProjectAndContributor(
    projectHash, contributorHash
  );

  // Получаем завершённые задачи участника в этом проекте
  const completedIssues = await this.issueRepository.findCompletedByProjectAndCreatorsHashs(
    projectHash, [contributorHash]
  );

  // Фильтруем записи времени только по завершённым задачам
  const availableEntries = uncommittedEntries.filter(entry =>
    completedIssues.some(issue => issue.issue_hash === entry.issue_hash)
  );

  // Сортируем по дате (старые сначала)
  availableEntries.sort((a, b) => a.date.localeCompare(b.date));

  // Фиксируем указанное количество часов
  let remainingHours = hours;
  // ... логика фиксации
}
```

### Доступное время для коммита

Доступное время для коммита рассчитывается **только по завершённым задачам**. **Ограничение в 8 часов НЕ применяется** - можно использовать всё накопленное время по завершённым задачам:

```typescript
async getAvailableCommitHours(contributorHash, projectHash): Promise<number> {
  // Получаем базовую статистику
  const basicStats = await this.timeEntryRepository.getContributorProjectStats(contributorHash, projectHash);

  // Рассчитываем детальную статистику
  const detailedStats = await this.calculateDetailedProjectStats(contributorHash, projectHash, basicStats);

  return detailedStats.available_hours; // Без ограничения - можно использовать всё накопленное время по завершённым задачам
}
```

### Создание коммита с указанием часов

Пользователь указывает точное количество часов для коммита, система проверяет доступность:

```typescript
async createCommit(data: CreateCommitDomainInput): Promise<TransactResult> {
  // Получаем доступное время
  const availableHours = await this.timeTrackingService.getAvailableCommitHours(
    contributorHash, projectHash
  );

  // Проверяем что запрошенное количество часов не превышает доступное
  if (data.commit_hours > availableHours) {
    throw new Error(`Requested commit hours exceed available hours`);
  }

  // Фиксируем указанное количество времени
  await this.timeTrackingService.commitTime(
    contributorHash, projectHash, data.commit_hours, commitHash
  );
}
```

## Статистика и отчёты

### Что возвращает статистика сейчас

После внесённых изменений статистика возвращает детальную разбивку времени:

- **committed_hours**: Время, зафиксированное в коммитах (уже оплачено/учтено)
- **available_hours**: Время по завершённым задачам (DONE), доступное для фиксации в коммит
- **pending_hours**: Время по незавершённым задачам (IN_PROGRESS), которое станет доступным после завершения задач
- **total_uncommitted_hours**: available_hours + pending_hours (весь незакоммиченный объём)

### Статистика по проекту для участника

```typescript
interface TimeStatsDomainInterface {
  contributor_hash: string;
  project_hash: string;
  total_committed_hours: number;      // Зафиксированные часы
  total_uncommitted_hours: number;    // Незакоммиченные часы (available + pending)
  available_hours: number;            // Доступные для коммита часы (по завершённым задачам)
  pending_hours: number;              // Часы в ожидании (по незавершённым задачам)
}
```

### Проекты участника со статистикой

```typescript
interface ContributorProjectsTimeStatsDomainInterface {
  contributor_hash: string;
  projects: Array<{
    project_hash: string;
    project_name: string;
    contributor_hash: string;
    total_committed_hours: number;
    total_uncommitted_hours: number;
    available_hours: number;
    pending_hours: number;
  }>;
}
```

## API методы

### Основные методы TimeTrackingInteractor

1. **getTimeStats(data)** - Статистика времени участника по проекту
2. **getContributorProjectsTimeStats(data)** - Проекты участника со статистикой
3. **getTimeEntries(data, options)** - Пагинированные записи времени
4. **getFlexibleTimeStats(data, options)** - Гибкий запрос статистики
5. **trackTime()** - Основная логика учёта (cron)
6. **commitTime(contributorHash, projectHash, hours, commitHash)** - Фиксация времени
7. **getAvailableCommitHours(contributorHash, projectHash)** - Доступное время

### Основные методы TimeTrackingService

1. **commitTime(contributorHash, projectHash, hours, commitHash)** - Фиксация времени
2. **getAvailableCommitHours(contributorHash, projectHash)** - Доступное время
3. **getTimeStats(contributorHash, projectHash)** - Статистика по проекту
4. **getContributorProjectsTimeStats(data)** - Проекты со статистикой
5. **getTimeEntriesByProject(filter, options)** - Записи времени по проекту
6. **getFlexibleTimeStats(data, options)** - Гибкая статистика

### CreateCommit API

**Входные параметры:**
- `coopname` - имя кооператива
- `username` - имя пользователя
- `project_hash` - хэш проекта
- `commit_hash` - хэш коммита
- `commit_hours` - **новое поле**: количество часов для фиксации

**Валидация:**
- `commit_hours > 0`
- `commit_hours <= available_hours` (доступное время по завершённым задачам)

**Процесс:**
1. Проверка существования пользователя
2. Расчёт доступного времени (только по завершённым задачам)
3. Валидация `commit_hours <= available_hours`
4. Фиксация указанного количества часов
5. Создание транзакции в блокчейне

## Сценарии использования

### 1. Автоматический учёт времени
- Каждый час система проверяет активных участников
- Для каждого участника начисляет время за активные задачи
- Время распределяется равномерно между задачами

### 2. Просмотр статистики
- Участник может посмотреть время по проектам
- Видит committed/uncommitted/available часы
- Может планировать коммиты

### 3. Фиксация времени в коммит
- При создании коммита пользователь **явно указывает количество часов** для фиксации
- Система проверяет что указанное количество не превышает available_hours (только по завершённым задачам)
- Время переносится из uncommitted в committed
- Если запрошено больше часов чем доступно - возвращается ошибка

### 4. Отчёты и аналитика
- Гибкие запросы статистики по разным фильтрам
- Пагинация для больших объёмов данных
- Группировка по проектам/участникам

## Архитектурные принципы

### Domain-Driven Design (DDD)

Система следует принципам Domain-Driven Design:

1. **Репозитории** - только базовые операции с данными (CRUD), без бизнес-логики
2. **Интеракторы** - содержат всю бизнес-логику, включая агрегацию данных из разных источников
3. **Изоляция** - репозитории не должны обращаться друг к другу
4. **Единая ответственность** - каждый компонент отвечает только за свою область

### Логика распределения ответственности

- **Репозиторий TimeEntry**: Возвращает базовую статистику (committed/uncommitted) из time_entries таблицы через `ContributorProjectBasicTimeStatsDomainInterface`
- **Интерактор TimeTracking**: Рассчитывает available/pending часы, агрегируя данные из time_entries и issues, возвращает полную статистику через `ContributorProjectTimeStatsDomainInterface`
- **Сервис TimeTracking**: Конвертирует доменные объекты в DTO для внешних интерфейсов

## Особенности реализации

1. **Индивидуальные лимиты**: Каждый участник имеет индивидуальный лимит часов в день (поле `hours_per_day`), по умолчанию 8 часов (применяется только в периодическом распределении времени)
2. **Равномерность**: Равное распределение между активными задачами (IN_PROGRESS)
3. **Условная доступность**: Время для коммита доступно только после завершения задач (DONE)
4. **Без ограничений при коммите**: При фиксации времени в коммит можно использовать всё накопленное время по завершённым задачам
5. **Pending vs Available**: pending_hours (незавершённые задачи) vs available_hours (завершённые задачи)
6. **Фильтрация по статусу**: Разделение логики учёта и фиксации времени
7. **DDD архитектура**: Соблюдение принципов Domain-Driven Design
8. **Персистентность**: Все изменения сохраняются в MongoDB
9. **Атомарность**: Операции фиксации времени атомарны
10. **Производительность**: Пагинация для больших запросов

## Мониторинг и отладка

- Логирование всех операций в TimeTrackingInteractor
- Отслеживание ошибок обработки отдельных участников
- Проверка консистентности данных
- Мониторинг работы cron задач

## Расширение системы

Возможные улучшения:
- Настраиваемые лимиты времени на участника
- Разные стратегии распределения времени
- Приоритеты задач
- Уведомления о начислении времени
- Интеграция с внешними системами учёта времени
