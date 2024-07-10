<template lang="pug">
q-btn(color="green" @click="supply") Подписать акт приёма
</template>

<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { ISupplyOnRequest } from '../model'

  const props = defineProps({
    coopname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    requestId: {
      type: Number,
      required: true,
    },
  })

  const supply = async () => {
    try {
      await api.supplyOnRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as ISupplyOnRequest)
      SuccessAlert('Ваша подпись принята')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
