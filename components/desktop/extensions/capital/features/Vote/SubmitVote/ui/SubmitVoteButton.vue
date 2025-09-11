<template lang="pug">
q-btn(
  color='primary',
  @click='handleSubmitVote',
  :loading='loading',
  label='Проголосовать'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSubmitVote } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { submitVote, submitVoteInput } = useSubmitVote();
const loading = ref(false);

const handleSubmitVote = async () => {
  loading.value = true;
  try {
    await submitVote(submitVoteInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
