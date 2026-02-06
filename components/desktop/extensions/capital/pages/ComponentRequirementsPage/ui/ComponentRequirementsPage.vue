<template lang="pug">
div
  // Виджет списка требований в виде таблицы
  RequirementsListWidget(
    :filter='requirementsFilter',
    :maxItems='50'
    :permissions='componentPermissions'
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

const componentPermissions = ref<IProjectPermissions | null>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр для требований компонента (включая задачи компонента)
const requirementsFilter = computed(() => ({
  project_hash: projectHash.value,
  show_components_requirements: true,
  show_issues_requirements: false,
}));

// Загрузка разрешений компонента
const loadComponentPermissions = async () => {
  try {
    const component = await projectStore.loadProject({ hash: projectHash.value });
    if (component?.permissions) {
      componentPermissions.value = component.permissions;
    }
  } catch (error) {
    console.error('Ошибка при загрузке разрешений компонента:', error);
  }
};

// Инициализация
onMounted(async () => {
  await loadComponentPermissions();
});
</script>

<style lang="scss" scoped>
</style>
