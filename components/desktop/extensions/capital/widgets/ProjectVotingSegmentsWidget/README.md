# ProjectVotingSegmentsWidget

Виджет для отображения участников голосования по методу Водянова с возможностью распределения голосов.

## Назначение

Виджет предназначен для:
- Отображения вкладчиков проекта, имеющих право голоса (фильтр `has_vote: true`)
- Распределения голосующей суммы между участниками
- Валидации корректности распределения голосов
- Отправки голосов через кнопку `SubmitVoteButton`

## Особенности

1. **Автоматическая фильтрация**: Загружает только сегменты с правом голоса
2. **Валидация голосования**:
   - Нельзя голосовать за себя
   - Должны быть распределены голоса всем участникам кроме себя
   - Общая сумма должна равняться активной голосующей сумме
3. **Визуальная обратная связь**: Показывает распределенную сумму и остаток
4. **Блокировка после голосования**: После отправки голосов виджет переходит в режим readonly

## Props

- `projectHash` (string) - Хеш проекта для голосования
- `coopname` (string) - Наименование кооператива
- `expanded` (Record<string, boolean>) - Состояние разворота участников
- `project` (IProject) - Объект проекта с данными голосования
- `currentUsername` (string) - Имя текущего пользователя

## События

- `toggle-expand` - Переключение разворота участника
- `segment-click` - Клик на строку участника
- `data-loaded` - Загружены данные участников

## Слоты

- `segment-content` - Контент для отображения под строкой участника (например, `SegmentVotesWidget`)

## Пример использования

```vue
<ProjectVotingSegmentsWidget
  :project-hash="project.project_hash"
  :coopname="info.coopname"
  :expanded="expandedSegments"
  :project="project"
  :current-username="info.username"
  @toggle-expand="handleSegmentToggleExpand"
  @segment-click="handleSegmentClick"
  @data-loaded="handleSegmentsDataLoaded"
>
  <template #segment-content="{ segment }">
    <SegmentVotesWidget
      :project-hash="project.project_hash"
      :coopname="info.coopname"
      :segment-username="segment.username"
    />
  </template>
</ProjectVotingSegmentsWidget>
```

