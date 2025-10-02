import { ref, computed } from 'vue';

/**
 * Композабл для управления фильтрами проектов
 * Содержит всю логику работы с фильтрами и их применение
 */
export function useProjectFilters() {
  // Реактивные переменные для фильтров
  const projectStatuses = ref<string[]>([]);
  const projectPriorities = ref<string[]>([]);
  const hasIssuesWithStatuses = ref<string[]>([]);
  const hasIssuesWithPriorities = ref<string[]>([]);
  const hasIssuesWithCreators = ref<string[]>([]);
  const master = ref<string | undefined>();

  // Фильтры для задач в компонентах (для IssuesListWidget)
  const componentStatuses = ref<string[]>([]);
  const componentPriorities = ref<string[]>([]);
  const componentCreators = ref<string[]>([]);
  const componentMaster = ref<string | undefined>();

  // Ключ для принудительной перезагрузки ProjectsListWidget при изменении фильтров
  const projectsListKey = computed(() => {
    return `${hasIssuesWithStatuses.value.join(',')}-${hasIssuesWithPriorities.value.join(',')}-${hasIssuesWithCreators.value.join(',')}-${master.value || ''}`;
  });

  /**
   * Обработчик изменения фильтров из ListFilterWidget
   */
  const handleFiltersChanged = (filters: {
    statuses: string[];
    priorities: string[];
    creators: string[];
    master?: string;
  }) => {
    // Обновляем фильтры для задач в компонентах (для IssuesListWidget)
    componentStatuses.value = filters.statuses;
    componentPriorities.value = filters.priorities;
    componentCreators.value = filters.creators;
    componentMaster.value = filters.master;

    // Обновляем фильтры для проектов (фильтруем проекты по задачам с соответствующими статусами/приоритетами/создателями/мастером)
    hasIssuesWithStatuses.value = filters.statuses;
    hasIssuesWithPriorities.value = filters.priorities;
    hasIssuesWithCreators.value = filters.creators;
    master.value = filters.master;
  };

  return {
    // Реактивные состояния для проектов
    projectStatuses,
    projectPriorities,
    hasIssuesWithStatuses,
    hasIssuesWithPriorities,
    hasIssuesWithCreators,
    master,

    // Реактивные состояния для задач в компонентах
    componentStatuses,
    componentPriorities,
    componentCreators,
    componentMaster,

    // Вычисляемые свойства
    projectsListKey,

    // Методы
    handleFiltersChanged,
  };
}
