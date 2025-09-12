<template lang="pug">
q-btn(
  color='primary',
  @click='handleCalculateVotes',
  :loading='loading',
  label='Рассчитать голоса'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCalculateVotes } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { calculateVotes, calculateVotesInput } = useCalculateVotes();
const loading = ref(false);

const handleCalculateVotes = async () => {
  loading.value = true;
  try {
    await calculateVotes(calculateVotesInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
