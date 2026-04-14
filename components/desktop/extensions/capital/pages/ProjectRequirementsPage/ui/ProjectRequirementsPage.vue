<template lang="pug">
div
  .flex.flex-center.q-pa-lg(v-if='!permissionsLoaded')
    q-spinner(color='primary' size='40px')
  RequirementsListWidget(
    v-else
    :filter='requirementsFilter',
    :maxItems='50'
    :permissions='projectPermissions'
    detail-route-name='project-requirement-detail'
    :show-component-scope-badge='true'
  )
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { RequirementsListWidget } from 'app/extensions/capital/widgets/RequirementsListWidget';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';

const route = useRoute();
const projectStore = useProjectStore();

const projectPermissions = ref<IProjectPermissions | null>(null);
const permissionsLoaded = ref(false);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр: артефакты корня + всех дочерних компонентов (задачи — отдельным флагом при необходимости)
const requirementsFilter = computed(() => ({
  project_hash: projectHash.value,
  show_components_requirements: true,
  show_issues_requirements: false,
}));

// Загрузка разрешений проекта (до списка артефактов — иначе canEdit временно false)
const loadProjectPermissions = async () => {
  permissionsLoaded.value = false;
  try {
    const project = await projectStore.loadProject({ hash: projectHash.value });
    projectPermissions.value = project?.permissions ?? null;
  } catch (error) {
    console.error('Ошибка при загрузке разрешений проекта:', error);
    projectPermissions.value = null;
  } finally {
    permissionsLoaded.value = true;
  }
};

watch(projectHash, () => {
  void loadProjectPermissions();
});

onMounted(async () => {
  await loadProjectPermissions();
});
</script>

<style lang="scss" scoped>
</style>
