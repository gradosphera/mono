<template lang="pug">
div
  // Компонент планирования (всегда показывается)
  ProjectPlanningWidget(:project='project' :permissions='permissions')
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { ProjectPlanningWidget } from 'app/extensions/capital/widgets/ProjectPlanningWidget';

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Computed для разрешений
const permissions = computed((): IProjectPermissions | null => {
  return project.value?.permissions || null;
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
