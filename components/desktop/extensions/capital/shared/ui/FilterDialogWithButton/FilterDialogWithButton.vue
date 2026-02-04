<template lang="pug">
div
  // Кнопка для открытия диалога
  q-btn(
    size="md"
    flat
    icon="filter_list"
    label="Фильтры"
    :stretch="stretch"
    :style="style"
    @click="handleClick"
  )
    q-badge(
      v-if="hasActiveFilters"
      color="red"
      floating
      rounded
    )

  // Диалог фильтров
  FilterDialog(
    ref="filterDialogRef"
    title="Фильтры проектов"
    @filters-applied="handleFiltersApplied"
  )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { FilterDialog } from 'app/extensions/capital/features/FilterDialog';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

// Props для стилизации из header
defineProps<{
  stretch?: boolean;
  style?: Record<string, any>;
}>();

// Используем store для фильтров
const projectStore = useProjectStore();

// Refs
const filterDialogRef = ref<any>();

// Computed для проверки активных фильтров
const hasActiveFilters = computed(() => projectStore.hasActiveProjectFilters);

// Обработчик клика по кнопке
const handleClick = () => {
  filterDialogRef.value?.openDialog();
};

// Обработчик применения фильтров
const handleFiltersApplied = (filters: any) => {
  projectStore.setProjectFilters(filters);
};
</script>

<style lang="sass" scoped>
@import 'src/app/styles/variables'
</style>
