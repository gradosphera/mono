<template lang="pug">
q-btn(color="green" @click="delivered") Подтвердить доставку
</template>

<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IDeliverOnRequest } from '../model'

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

  const delivered = async () => {
    try {
      await api.deliverOnRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IDeliverOnRequest)

      SuccessAlert('Подтверждение принято')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
