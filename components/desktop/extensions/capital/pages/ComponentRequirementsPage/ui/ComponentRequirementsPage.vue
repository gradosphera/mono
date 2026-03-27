<template lang="pug">
div
  .flex.flex-center.q-pa-lg(v-if='!permissionsLoaded')
    q-spinner(color='primary' size='40px')
  RequirementsListWidget(
    v-else
    :filter='requirementsFilter',
    :maxItems='50'
    :permissions='componentPermissions'
    detail-route-name='component-requirement-detail'
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

const componentPermissions = ref<IProjectPermissions | null>(null);
const permissionsLoaded = ref(false);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Фильтр для требований компонента (включая задачи компонента)
const requirementsFilter = computed(() => ({
  project_hash: projectHash.value,
  show_components_requirements: true,
  show_issues_requirements: false,
}));

const loadComponentPermissions = async () => {
  permissionsLoaded.value = false;
  try {
    const component = await projectStore.loadProject({ hash: projectHash.value });
    componentPermissions.value = component?.permissions ?? null;
  } catch (error) {
    console.error('Ошибка при загрузке разрешений компонента:', error);
    componentPermissions.value = null;
  } finally {
    permissionsLoaded.value = true;
  }
};

watch(projectHash, () => {
  void loadComponentPermissions();
});

onMounted(async () => {
  await loadComponentPermissions();
});
</script>

<style lang="scss" scoped>
</style>
