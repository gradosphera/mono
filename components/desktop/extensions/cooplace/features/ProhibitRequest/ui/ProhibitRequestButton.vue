<template lang="pug">
q-btn(color="red" @click="prohibit") отклонить модерацию  
</template>

<script setup lang="ts">
  import { SuccessAlert } from 'src/shared/api'
  import { api } from '../api'

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

  const prohibit = async () => {
    try {
      await api.prohibitRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      })
      SuccessAlert('Заявка отлонена')
    } catch (e: any) {
      SuccessAlert(e.message)
    }
  }
</script>
