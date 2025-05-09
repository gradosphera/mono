<template lang="pug">
q-btn(color="green" @click="recieve") получил имущество
</template>
<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IRecieveOnRequest } from '../model'

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

  const recieve = async () => {
    try {
      await api.recieveOnRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IRecieveOnRequest)

      SuccessAlert('Подтверждение принято')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
