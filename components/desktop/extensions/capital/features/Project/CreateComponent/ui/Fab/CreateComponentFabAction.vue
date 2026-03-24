<template lang="pug">
q-fab-action.bg-fab-accent-radial(
  icon="add"
  :label="fabLabel"
  @click="dialogRef?.openDialog()"
  text-color="white"
)
  CreateComponentDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CreateComponentDialog } from '../Dialog';
import { formatCapitalFabLabel } from 'app/extensions/capital/shared/lib';

const fabLabel = formatCapitalFabLabel('Компонент', 'component');
import type { IProject } from 'app/extensions/capital/entities/Project/model';

defineProps<{
  project: IProject;
}>();

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

const handleSuccess = () => {
  emit('actionCompleted');
};

defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
});
</script>
