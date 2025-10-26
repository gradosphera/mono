<template lang="pug">
div
  // Компонент планирования (всегда показывается)
  ProjectPlanningWidget(:project='project' :permissions='permissions')
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { ProjectPlanningWidget } from 'app/extensions/capital/widgets/ProjectPlanningWidget';
import { useDataPoller } from 'src/shared/lib/composables';
import { POLL_INTERVALS } from 'src/shared/lib/consts';

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Computed для разрешений
const permissions = computed((): IProjectPermissions | null => {
  return project.value?.permissions || null;
});

/**
 * Функция для перезагрузки данных проекта
 * Используется для poll обновлений
 */
const reloadProjectData = async () => {
  try {
    // Перезагружаем данные текущего проекта
    await loadProject();
  } catch (error) {
    console.warn('Ошибка при перезагрузке данных проекта в poll:', error);
  }
};

// Настраиваем poll обновление данных
const { start: startProjectPoll, stop: stopProjectPoll } = useDataPoller(
  reloadProjectData,
  { interval: POLL_INTERVALS.MEDIUM, immediate: false }
);

// Инициализация
onMounted(async () => {
  await loadProject();

  // Запускаем poll обновление данных
  startProjectPoll();
});

// Останавливаем poll при уходе со страницы
onBeforeUnmount(() => {
  stopProjectPoll();
});
</script>

<style lang="scss" scoped>
</style>
