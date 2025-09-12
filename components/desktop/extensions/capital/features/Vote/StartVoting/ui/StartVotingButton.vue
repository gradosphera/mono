<template lang="pug">
q-btn(
  color='primary',
  @click='handleStartVoting',
  :loading='loading',
  label='Запустить голосование'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStartVoting } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { startVoting, startVotingInput } = useStartVoting();
const loading = ref(false);

const handleStartVoting = async () => {
  loading.value = true;
  try {
    await startVoting(startVotingInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
