<script lang="ts" setup>
import { useRequestStore } from 'src/entities/Request/model/stores'
import { SupplyOrderRequest } from 'src/widgets/Request/SupplyOrderRequestCard'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const requestsStore = useRequestStore()
const route = useRoute()
const coopname = computed(() => route.params.coopname)

requestsStore.loadAllChildOrders({ coopname: coopname.value as string })
const orders = computed(() => requestsStore.allChildOrders)
</script>

<template lang="pug">
div.row
  div(v-for="order in orders" :key="order.id").q-pa-md.col-md-12.col-xs-12
    SupplyOrderRequest(:request="order")
</template>
