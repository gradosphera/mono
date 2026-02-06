<template lang="pug">
q-fab-action(
  v-if="canCreateRequirement"
  icon="assignment"
  @click="dialogRef?.openDialog()"
  text-color="white"
).bg-fab-accent-radial Требование
  CreateRequirementWithEditorDialog(
    ref="dialogRef"
    :filter="filter"
    @success="handleSuccess"
  )

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { CreateRequirementWithEditorDialog } from '../Dialog'
import type { IIssuePermissions } from 'app/extensions/capital/entities/Issue/model';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';

const props = withDefaults(defineProps<{
  filter?: {
    project_hash?: string;
    issue_id?: string;
  };
  permissions?: IIssuePermissions | IProjectPermissions | null;
}>(), {
  filter: undefined,
  permissions: null,
});

const emit = defineEmits<{
  actionCompleted: [];
}>();

const dialogRef = ref();

// Определяем, можем ли мы создавать требование
const canCreateRequirement = computed((): boolean => {
  if (!props.permissions) return false;

  // Проверяем поле can_create_requirement в зависимости от типа разрешений
  return 'can_create_requirement' in props.permissions
    ? Boolean(props.permissions.can_create_requirement)
    : false;
});

const handleSuccess = () => {
  emit('actionCompleted');
};
</script>
