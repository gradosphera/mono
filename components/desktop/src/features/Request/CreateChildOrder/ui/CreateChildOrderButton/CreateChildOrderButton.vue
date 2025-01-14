<script setup lang="ts">
  import { FailAlert, SuccessAlert } from 'src/shared/api'
  import { api } from '../../api'
  import type { ICreateChildOrderProps } from '../../model'
  import { withDefaults } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const props = withDefaults(defineProps<ICreateChildOrderProps>(), {})

  const createOrder = async () => {
    try {
      await api.createChildOrder({
        coopname: props.coopname,
        username: props.username,
        parent_id: props.offer.id,
        program_id: props.offer.program_id,
        pieces: props.units,
        unit_cost: props.offer.unit_cost,
      })
      SuccessAlert('Заказ создан')
      router.push({ name: 'marketplace-user-supplies' }) //TODO роутинг
    } catch (e: any) {
      FailAlert(e.message)
    }
  }
</script>
<template lang="pug">
q-btn(size="lg" @click="createOrder") оплатить 
</template>
