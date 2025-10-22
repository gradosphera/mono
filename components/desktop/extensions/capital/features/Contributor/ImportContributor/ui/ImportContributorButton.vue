<template lang="pug">
q-btn(
  color='secondary',
  @click='handleImportContributor',
  :loading='loading',
  label='Импортировать участника'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useImportContributor } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { importContributor, importContributorInput } = useImportContributor();
const loading = ref(false);

const handleImportContributor = async () => {
  loading.value = true;
  try {
    await importContributor(importContributorInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
