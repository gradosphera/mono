<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Соавторы проекта

  // Список соавторов
  ProjectAuthorsList(:project='project')
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import ProjectAuthorsList from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget/ProjectAuthorsList.vue';

// Используем composable для загрузки проекта
const { project, loadProject } = useProjectLoader();

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
