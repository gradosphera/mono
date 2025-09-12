<template lang="pug">
q-btn(
  color='primary',
  @click='handleCreateCommit',
  :loading='loading',
  label='Создать коммит'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCreateCommit } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { createCommit, createCommitInput } = useCreateCommit();
const loading = ref(false);

const handleCreateCommit = async () => {
  loading.value = true;
  try {
    await createCommit(createCommitInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
