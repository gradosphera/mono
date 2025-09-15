<template lang="pug">
.row.items-center.q-gutter-sm
  // Статус проекта
  q-chip(
    :color='getProjectStatusColor(project.status)',
    text-color='white',
    dense,
    :label='getProjectStatusLabel(project.status)'
  )

  // Разделитель
  q-separator(vertical)

  // Кнопки управления проектами
  Project.StartProject.StartProjectButton(
    v-if='canStartProject',
    size='sm',
    dense
  )

  Project.OpenProject.OpenProjectButton(
    v-if='canOpenProject',
    size='sm',
    dense
  )

  Project.AddAuthor.AddAuthorButton(v-if='canAddAuthor', size='sm', dense)

  Project.DeleteProject.DeleteProjectButton(
    v-if='canDeleteProject',
    size='sm',
    dense
  )

  Project.FundProject.FundProjectButton(
    v-if='canFundProject',
    size='sm',
    dense
  )

  Project.RefreshProject.RefreshProjectButton(
    v-if='canRefreshProject',
    size='sm',
    dense
  )

  Project.SetMaster.SetMasterButton(v-if='canSetMaster', size='sm', dense)

  Project.SetPlan.SetPlanButton(v-if='canSetPlan', size='sm', dense)
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Project } from 'app/extensions/capital/features';
import {
  getProjectStatusColor,
  getProjectStatusLabel,
} from 'app/extensions/capital/shared/lib/projectStatus';

// Props
interface Props {
  project: {
    hash: string;
    status: string;
    name: string;
  };
}

const props = defineProps<Props>();

// Вычисляемые свойства для доступности действий
const canStartProject = computed(() => {
  return props.project.status === 'pending' || props.project.status === 'draft';
});

const canOpenProject = computed(() => {
  return props.project.status === 'active';
});

const canAddAuthor = computed(() => {
  return ['pending', 'active', 'draft'].includes(props.project.status);
});

const canDeleteProject = computed(() => {
  return ['pending', 'draft', 'cancelled'].includes(props.project.status);
});

const canFundProject = computed(() => {
  return props.project.status === 'active';
});

const canRefreshProject = computed(() => {
  return ['active', 'pending'].includes(props.project.status);
});

const canSetMaster = computed(() => {
  return ['pending', 'active', 'draft'].includes(props.project.status);
});

const canSetPlan = computed(() => {
  return ['pending', 'active', 'draft'].includes(props.project.status);
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.q-btn {
  font-size: 12px;
  min-height: 32px;
}
</style>
