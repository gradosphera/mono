<template lang="pug">
q-btn(color="green" @click="complete") завершить поставку
</template>
<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { ICompleteOnRequest } from '../model'

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

  const complete = async () => {
    try {
      await api.complete({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as ICompleteOnRequest)

      SuccessAlert('Подтверждение принято')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
