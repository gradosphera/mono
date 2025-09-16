<template lang="pug">
.row.items-center.q-gutter-sm
  // Статус проекта

  //- p {{ project }}
  //- q-chip(
  //-   :color='getProjectStatusColor(project.status)',
  //-   text-color='white',
  //-   :label='getProjectStatusLabel(project.status)'
  //- )

  // Кнопки управления проектами
  StartProjectButton(size='sm', v-if='canStartProject', :project='project')

  OpenProjectButton(v-if='canOpenProject', size='sm', :project='project')

  AddAuthorButton(v-if='canAddAuthor', size='sm', :project='project')

  //- DeleteProjectButton(v-if='canDeleteProject', size='sm', dense)

  SetMasterButton(v-if='canSetMaster', size='sm', :project='project')

  SetPlanButton(v-if='canSetPlan', size='sm', :project='project')
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { StartProjectButton } from 'app/extensions/capital/features/Project/StartProject';
import { OpenProjectButton } from 'app/extensions/capital/features/Project/OpenProject';
import { AddAuthorButton } from 'app/extensions/capital/features/Project/AddAuthor';
import { SetMasterButton } from 'app/extensions/capital/features/Project/SetMaster';
import { SetPlanButton } from 'app/extensions/capital/features/Project/SetPlan';
import type { IProject } from '../../entities/Project/model';

// import {
//   getProjectStatusColor,
//   getProjectStatusLabel,
// } from 'app/extensions/capital/shared/lib/projectStatus';

const props = defineProps<{ project: IProject }>();

// Вычисляемые свойства для доступности действий
const canStartProject = computed(() => {
  return props.project?.status === Zeus.ProjectStatus.PENDING;
});

const canOpenProject = computed(() => {
  return props.project?.is_opened === false;
});

const canAddAuthor = computed(() => {
  return [Zeus.ProjectStatus.PENDING, Zeus.ProjectStatus.ACTIVE].includes(
    props.project?.status as Zeus.ProjectStatus,
  );
});

const canSetMaster = computed(() => {
  return [Zeus.ProjectStatus.PENDING, Zeus.ProjectStatus.ACTIVE].includes(
    props.project?.status as Zeus.ProjectStatus,
  );
});

const canSetPlan = computed(() => {
  return [Zeus.ProjectStatus.PENDING, Zeus.ProjectStatus.ACTIVE].includes(
    props.project?.status as Zeus.ProjectStatus,
  );
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
