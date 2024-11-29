<template lang="pug">
div
  q-input(dense v-model="data.account_number" standout="bg-teal text-white" label="Номер счёта")
  q-input(dense v-model="data.bank_name" standout="bg-teal text-white" label="Наименование банка")
  q-input(dense v-model="data.currency" standout="bg-teal text-white" label="Валюта счёта")
  q-input(dense v-model="data.details.bik" standout="bg-teal text-white" label="БИК")
  q-input(dense v-model="data.details.kpp" standout="bg-teal text-white" label="КПП")
  q-input(dense v-model="data.details.corr" standout="bg-teal text-white" label="Коррсчёт")

</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { ModelTypes } from '@coopenomics/coopjs';

const props = defineProps({
  bankDetails: {
    type: Object as () => ModelTypes['BankAccount'],
    required: true
  }
})

const data = ref(props.bankDetails)

const showSave = ref(false)

watch(
    data,
    () => {
      showSave.value = true
    },
    { deep: true }
  );

</script>
