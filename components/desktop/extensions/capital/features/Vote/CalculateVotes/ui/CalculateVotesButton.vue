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

interface Props {
  coopname: string;
  projectHash: string;
  username: string;
}

const props = defineProps<Props>();

const { calculateVotes } = useCalculateVotes();
const loading = ref(false);

const handleCalculateVotes = async () => {
  loading.value = true;
  try {
    await calculateVotes({
      coopname: props.coopname,
      project_hash: props.projectHash,
      username: props.username,
    });
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
