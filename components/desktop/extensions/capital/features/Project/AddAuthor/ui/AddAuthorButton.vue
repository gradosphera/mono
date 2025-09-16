<template lang="pug">
q-btn(
  color='primary',
  @click='handleAddAuthor',
  :loading='loading',
  label='Добавить автора'
)
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAddAuthor } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject }>();

const { addAuthor, addAuthorInput } = useAddAuthor();
const loading = ref(false);

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject) {
      addAuthorInput.value.coopname = newProject.coopname || '';
      addAuthorInput.value.project_hash = newProject.project_hash;
    }
  },
  { immediate: true },
);

const handleAddAuthor = async () => {
  loading.value = true;
  try {
    await addAuthor(addAuthorInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
