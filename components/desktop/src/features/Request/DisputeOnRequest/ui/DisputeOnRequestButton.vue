<template lang="pug">
q-btn(color="red" @click="dispute") вернуть по гарантии
</template>
<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IDisputeOnRequest } from '../model'

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

  const dispute = async () => {
    try {
      await api.dispute({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      } as IDisputeOnRequest)

      SuccessAlert('Спор открыт')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
