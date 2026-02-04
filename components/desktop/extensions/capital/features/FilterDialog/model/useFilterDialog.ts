import { ref, computed } from 'vue';

export interface IFilterState {
  statuses: string[];
  priorities: string[];
  creators: string[];
  master?: string;
}

export function useFilterDialog() {
  const dialogRef = ref<any>(null);
  const currentFilters = ref<IFilterState>({
    statuses: [],
    priorities: [],
    creators: [],
    master: undefined,
  });

  // Методы управления диалогом
  const openDialog = () => {
    dialogRef.value?.openDialog();
  };

  const closeDialog = () => {
    dialogRef.value?.closeDialog();
  };

  // Обработчик применения фильтров
  const handleFiltersApplied = (filters: IFilterState) => {
    currentFilters.value = { ...filters };
  };

  // Метод сброса фильтров
  const resetFilters = () => {
    currentFilters.value = {
      statuses: [],
      priorities: [],
      creators: [],
      master: undefined,
    };
  };

  // Computed для проверки, есть ли активные фильтры
  const hasActiveFilters = computed(() => {
    return (
      currentFilters.value.statuses.length > 0 ||
      currentFilters.value.priorities.length > 0 ||
      currentFilters.value.creators.length > 0 ||
      !!currentFilters.value.master
    );
  });

  return {
    dialogRef,
    currentFilters,
    openDialog,
    closeDialog,
    handleFiltersApplied,
    resetFilters,
    hasActiveFilters,
  };
}