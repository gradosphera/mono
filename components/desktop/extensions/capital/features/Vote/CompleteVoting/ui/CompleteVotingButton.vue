<template lang="pug">
q-btn(
  color='primary',
  @click='handleCompleteVoting',
  :loading='loading',
  label='Завершить голосование'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCompleteVoting } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { completeVoting, completeVotingInput } = useCompleteVoting();
const loading = ref(false);

const handleCompleteVoting = async () => {
  loading.value = true;
  try {
    await completeVoting(completeVotingInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
