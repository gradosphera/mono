<template lang="pug">
q-btn(color="green" @click="accept") подтвердить
</template>
<script setup lang="ts">
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { api } from '../api'
import type { IAcceptRequest } from '../model'

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

const accept = async () => {
  try {
    await api.acceptRequest({
      coopname: props.coopname,
      username: props.username,
      request_id: props.requestId,
    } as IAcceptRequest)

    SuccessAlert('Заявка принята')
  } catch (e: any) {
    FailAlert(e.message)
  }
}
</script>
