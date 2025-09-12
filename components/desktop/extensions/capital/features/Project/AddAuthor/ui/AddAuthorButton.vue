<template lang="pug">
q-btn(
  color='primary',
  @click='handleAddAuthor',
  :loading='loading',
  label='Добавить автора'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAddAuthor } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { addAuthor, addAuthorInput } = useAddAuthor();
const loading = ref(false);

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
