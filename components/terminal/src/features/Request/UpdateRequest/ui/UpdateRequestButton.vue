<template lang="pug">
q-btn(color="red" @click="decline") сохранить
</template>

<script setup lang="ts">
  import { SuccessAlert } from 'src/shared/api'
  import { api } from '../api'
  import type { IUpdateRequestData } from '../model'
  const emit = defineEmits(['saved'])
  const props = withDefaults(defineProps<IUpdateRequestData>(), {})

  const decline = async () => {
    try {
      await api.updateRequestData({
        coopname: props.coopname,
        username: props.username,
        requestId: props.requestId,
        remainUnits: props.remainUnits,
        unitCost: props.unitCost,
        data: props.data,
      })
      emit('saved')
      SuccessAlert('Заявка обновлена')
    } catch (e: any) {
      SuccessAlert(e.message)
    }
  }
</script>
