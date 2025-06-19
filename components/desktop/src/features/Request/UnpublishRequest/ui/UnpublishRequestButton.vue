<template lang="pug">
q-btn(@click="unpublish") снять с публикации
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

  const unpublish = async () => {
    try {
      await api.unpublishRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
      })
      SuccessAlert('Заявка снята с публикации')
    } catch (e: any) {
      FailAlert(e)
    }
  }
</script>
