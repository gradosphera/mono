<template lang="pug">
div
  // Виджет списка требований в виде таблицы
  RequirementsListWidget(
    :filter='requirementsFilter',
    :maxItems='50'
    :permissions='projectPermissions'
  )
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { RequirementsListWidget } from 'app/extensions/capital/widgets/RequirementsListWidget';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';

const route = useRoute();
const projectStore = useProjectStore();

const projectPermissions = ref<IProjectPermissions | null>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр для требований проекта (включая компоненты и задачи)
const requirementsFilter = computed(() => ({
  project_hash: projectHash.value,
  show_components_requirements: false,
  show_issues_requirements: false,
}));

// Загрузка разрешений проекта
const loadProjectPermissions = async () => {
  try {
    const project = await projectStore.loadProject({ hash: projectHash.value });
    if (project?.permissions) {
      projectPermissions.value = project.permissions;
    }
  } catch (error) {
    console.error('Ошибка при загрузке разрешений проекта:', error);
  }
};

// Инициализация
onMounted(async () => {
  await loadProjectPermissions();
});
</script>

<style lang="scss" scoped>
</style>
