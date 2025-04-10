<template lang="pug">
q-btn(@click="publish") опубликовать
</template>

<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
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

  const publish = async () => {
    try {
      await api.publishRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      })
      SuccessAlert('Заявка опубликована')
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
