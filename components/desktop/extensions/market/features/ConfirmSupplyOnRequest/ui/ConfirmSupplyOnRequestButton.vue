<template lang="pug">
q-btn(color="green" @click="supply") Подписать акт передачи
</template>

<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IConfirmSupplyOnRequest } from '../model'

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
      await api.confirmSupply({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IConfirmSupplyOnRequest)

      SuccessAlert('Имущество принято в кооператив')
    } catch (e: any) {
      FailAlert(e)
    }
  }
</script>
