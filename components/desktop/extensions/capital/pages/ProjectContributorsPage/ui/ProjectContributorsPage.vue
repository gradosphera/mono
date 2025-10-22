<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Участники проекта

  // Список участников
  ProjectContributorsList(:project='project')
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import ProjectContributorsList from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget/ProjectContributorsList.vue';

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
