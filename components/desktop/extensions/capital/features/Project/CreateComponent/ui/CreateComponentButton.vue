<template lang="pug">
q-btn(
  @click.stop='handleButtonClick',
  :loading='loading',
  :label='mini ? "" : "Компонент"',
  :icon='mini ? "add" : "add"',
  :size='mini ? "sm" : "md"',
  flat,
  :dense="isMobile"
)

  CreateComponentDialog(
    ref="dialogRef"
    :project="project"
    @success="handleSuccess"
  )

</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { useWindowSize } from 'src/shared/hooks';
import { CreateComponentDialog } from './Dialog';

const { isMobile } = useWindowSize();

defineProps<{
  project: IProject;
  mini?: boolean;
}>();

const emit = defineEmits<{
  onClick: [];
}>();

const loading = ref(false);
const dialogRef = ref();

const handleButtonClick = () => {
  // Сначала отправляем событие для закрытия меню
  // Потом открываем диалог
  dialogRef.value?.openDialog();
};

const handleSuccess = () => {
  // После успешного создания компонента отправляем событие для закрытия меню
  emit('onClick');
};
</script>
