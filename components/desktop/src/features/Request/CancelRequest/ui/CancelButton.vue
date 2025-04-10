<template lang="pug">
q-btn(color="red" @click="cancel") отменить поставку
</template>
<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { ICancelRequest } from '../model'

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

  const cancel = async () => {
    try {
      await api.cancelRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as ICancelRequest)
      SuccessAlert('Заявка отменена')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
