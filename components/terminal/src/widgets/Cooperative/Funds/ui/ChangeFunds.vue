<script setup lang="ts">
import { useCooperativeStore } from 'src/entities/Cooperative';
import { default as AccumulationFunds} from './AccumulationFunds.vue'
import { default as ExpenseFunds} from './ExpenseFunds.vue'

import { FailAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config';
import { computed } from 'vue';

const coop = useCooperativeStore()

const loadFunds = async () => {
  try {
    await coop.loadFunds(COOPNAME)
  } catch(e: any){
    FailAlert(e.message)
  }
}

loadFunds()

const accumulationFunds = computed(() => coop.accumulationFunds)
const expenseFunds = computed(() => coop.expenseFunds)

</script>

<template lang="pug">
div
  AccumulationFunds(:accumulationFunds="accumulationFunds")

  ExpenseFunds(:expenseFunds="expenseFunds" style="margin-top: 50px;")

</template>
