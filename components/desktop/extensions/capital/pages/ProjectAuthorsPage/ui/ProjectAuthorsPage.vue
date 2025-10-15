<template lang="pug">
div
  // Заголовок страницы
  h4.q-mb-md Соавторы проекта

  // Список соавторов
  ProjectAuthorsList(:project='project')
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import ProjectAuthorsList from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget/ProjectAuthorsList.vue';
import { FailAlert } from 'src/shared/api';

const route = useRoute();
const projectStore = useProjectStore();

// Состояние проекта
const project = ref<IProject | null | undefined>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Загрузка проекта из store (родитель уже должен загрузить)
const loadProject = async () => {
  // Ищем проект в store
  const foundProject = projectStore.projects.items.find(p => p.project_hash === projectHash.value);
  if (foundProject) {
    project.value = foundProject;
  } else {
    // Если проект не найден в store, пробуем загрузить
    try {
      await projectStore.loadProject({
        hash: projectHash.value,
      });
    } catch (error) {
      console.error('Ошибка при загрузке проекта:', error);
      FailAlert('Не удалось загрузить проект');
    }
  }
};

// Watcher для синхронизации локального состояния с store
watch(() => projectStore.projects.items, (newItems) => {
  if (newItems && projectHash.value) {
    const foundProject = newItems.find(p => p.project_hash === projectHash.value);
    if (foundProject) {
      project.value = foundProject;
    }
  }
});

// Watcher для изменения projectHash
watch(projectHash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    await loadProject();
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
</style>
