<template lang="pug">
q-btn(
  color='primary',
  @click='handleRegisterContributor',
  :loading='loading',
  label='Зарегистрировать вкладчика'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRegisterContributor } from '../model';
import { FailAlert } from 'src/shared/api/alerts';

const { registerContributor, registerContributorInput } =
  useRegisterContributor();
const loading = ref(false);

const handleRegisterContributor = async () => {
  loading.value = true;
  try {
    await registerContributor(registerContributorInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
