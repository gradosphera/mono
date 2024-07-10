<template lang="pug">
q-btn(color="green" @click="confirmRecieve") выдал имущество 
</template>
<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IConfirmRecieveOnRequest } from '../model'

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

  const confirmRecieve = async () => {
    try {
      await api.confirmRecieve({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IConfirmRecieveOnRequest)

      SuccessAlert('Выдача имущества подтверждена')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
