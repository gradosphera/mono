<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Финансирование проекта

  // Компонент планирования (показывается только если есть разрешение на редактирование)
  div(v-if="permissions?.can_edit_project")
    ProjectPlanning(:project='project')
  div(v-else)
    .text-grey-7.q-pa-md
      p У вас нет прав для редактирования финансового плана проекта
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import ProjectPlanning from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget/ProjectPlanning.vue';

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
