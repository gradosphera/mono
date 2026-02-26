<template lang="pug">
q-btn(color="red" @click="decline") отклонить  
</template>

<script setup lang="ts">
  import { SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IDeclineRequest } from '../model'

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

  const decline = async () => {
    try {
      await api.declineRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IDeclineRequest)
      SuccessAlert('Заявка отлонена')
    } catch (e: any) {
      SuccessAlert(e.message)
    }
  }
</script>
