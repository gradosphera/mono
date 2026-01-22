# Руководство по связям между сущностями

## Архитектура связей

### Основные сущности и их связи:

```
Project (Проект)
├── OneToMany → Issue (Задачи проекта)
├── OneToMany → Story (Проектные истории - где issue_id = null)
│
Issue (Задача)
├── ManyToOne → Project (Принадлежит проекту)
├── ManyToOne → Cycle (Принадлежит циклу)
├── OneToMany → Comment (Комментарии к задаче)
├── OneToMany → Story (Истории задачи - где issue_id = issue.id)
│
Cycle (Цикл)
├── OneToMany → Issue (Задачи цикла)
│
Story (История/Критерий)
├── ManyToOne → Project (Проектная история)
├── ManyToOne → Issue (История задачи)
│
Comment (Комментарий)
├── ManyToOne → Issue (Принадлежит задаче)
```

## Методы загрузки связанных данных

### Project Repository

```typescript
// Найти проект с задачами
const projectWithIssues = await projectRepository.findByIdWithIssues(projectHash);

// Найти проект с историями
const projectWithStories = await projectRepository.findByIdWithStories(projectHash);

// Найти проект со всеми связанными данными
const projectWithAll = await projectRepository.findByIdWithAllRelations(projectHash);
```

### Issue Repository

```typescript
// Найти задачу с комментариями
const issueWithComments = await issueRepository.findByIdWithComments(issueId);

// Найти задачу с историями
const issueWithStories = await issueRepository.findByIdWithStories(issueId);

// Найти задачу со всеми связанными данными
const issueWithAll = await issueRepository.findByIdWithAllRelations(issueId);

// Найти задачи проекта с комментариями
const issuesWithComments = await issueRepository.findByProjectHashWithComments(projectHash);

// Найти задачи проекта с историями
const issuesWithStories = await issueRepository.findByProjectHashWithStories(projectHash);
```

### Story Repository

```typescript
// Найти только проектные истории (issue_id = null)
const projectStories = await storyRepository.findByProjectHash(projectHash);

// Найти все истории проекта (проектные + истории всех задач проекта)
const allProjectStories = await storyRepository.findAllByProjectHash(projectHash);

// Найти только проектные истории (явный метод)
const projectOnlyStories = await storyRepository.findProjectStories(projectHash);

// Найти истории конкретной задачи
const issueStories = await storyRepository.findByIssueId(issueId);
```

### Cycle Repository

```typescript
// Найти цикл с задачами
const cycleWithIssues = await cycleRepository.findByIdWithIssues(cycleId);

// Найти активный цикл с задачами
const activeCycleWithIssues = await cycleRepository.findActiveCycleWithIssues();
```

### Comment Repository

```typescript
// Найти комментарий с задачей
const commentWithIssue = await commentRepository.findByIdWithIssue(commentId);

// Найти комментарии по комментатору
const commentsByCommentor = await commentRepository.findByCommentorId(commentorId);

// Найти комментарии задачи с комментаторами
const commentsWithCommentors = await commentRepository.findByIssueIdWithCommentors(issueId);
```

## Примеры использования

### Создание новой задачи с историями

```typescript
// Создать задачу
const issue = await issueRepository.create({
  title: 'Разработать API',
  project_hash: 'project123',
  created_by: 'user123',
  creators_ids: ['user123']
});

// Создать историю для задачи
const story = await storyRepository.create({
  title: 'Реализовать эндпоинт POST /api/users',
  description: 'Должен принимать JSON с полями name, email',
  project_hash: 'project123',
  issue_id: issue._id,
  created_by: 'user123'
});
```

### Получение полного проекта со всеми данными

```typescript
const project = await projectRepository.findByIdWithAllRelations('project123');
// Теперь project.issues содержит все задачи
// project.issues[0].comments содержит комментарии к задачам
// project.issues[0].stories содержит истории задач
// project.stories содержит только проектные истории
```

## Важные замечания

### Фильтрация историй проекта

- `findByProjectHash()` - возвращает только проектные истории (где `issue_id = null`)
- `findAllByProjectHash()` - возвращает все истории проекта (проектные + истории всех задач проекта)
- `findProjectStories()` - явный метод для проектных историй

### Каскадные операции

- При удалении проекта удаляются все связанные задачи, комментарии и истории
- При удалении задачи удаляются связанные комментарии и истории
- При удалении цикла задачи остаются, но `cycle_id` становится `null`

### Индексы

Все связи поддерживаются соответствующими индексами в базе данных для оптимальной производительности.
