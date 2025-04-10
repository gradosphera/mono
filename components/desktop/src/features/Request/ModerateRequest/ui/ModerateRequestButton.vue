<template lang="pug">
q-btn(color="red" @click="moderate") подтвердить модерацию
</template>

<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { ref } from 'vue'
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

  const cancellation_fee = ref(10)

  const moderate = async () => {
    try {
      await api.moderateRequest({
        coopname: props.coopname,
        username: props.username,
        request_id: props.requestId,
        cancellation_fee: cancellation_fee.value,
      })
      SuccessAlert('Модерация заявки подтверждена')
    } catch (e: any) {
      FailAlert(e)
    }
  }

</script>
