<template lang="pug">
// Рендерим как обычную кнопку, если передан флаг fab
q-btn(
  v-if="fab"
  color="accent"
  label="Инвестировать"
  icon="attach_money"
  @click="handleClick"
  :disable="!project?.is_planed"
  fab
).bg-fab-accent-radial
  q-tooltip(
    v-if="!project?.is_planed"
    anchor="top middle"
    self="bottom middle"
  )
    | Инвестирование доступно только для запланированных проектов
  CreateProjectInvestDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )

// Иначе рендерим как экшен для FAB
q-fab-action(
  v-else
  icon="attach_money"
  @click="handleClick"
  text-color="white"
  :disable="!project?.is_planed"
).bg-fab-accent-radial Инвестиция
  q-tooltip(
    v-if="!project?.is_planed"
    anchor="top middle"
    self="bottom middle"
  )
    | Инвестирование доступно только для запланированных проектов
  CreateProjectInvestDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateProjectInvestDialog } from '../Dialog';
import type { IProject } from '../../../../../entities/Project/model';

const props = defineProps<{
  project: IProject | null | undefined;
  fab?: boolean;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleClick = () => {
  if (props.project?.is_planed) {
    dialogRef.value?.openDialog();
  }
};

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
