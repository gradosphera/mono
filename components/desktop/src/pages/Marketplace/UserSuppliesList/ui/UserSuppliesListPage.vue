<script lang="ts" setup>
import { useRequestStore } from 'src/entities/Request/model/stores'
import { SupplyOrderRequest } from 'src/widgets/Request/SupplyOrderRequestCard'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const requestsStore = useRequestStore()
const route = useRoute()

const coopname = computed(() => route.params.coopname)

import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)


requestsStore.loadUserChildOrders({
  coopname: coopname.value as string,
  username: username.value as string,
})

const orders = computed(() => requestsStore.userChildOrders)
</script>

<template lang="pug">
div.row
  div(v-for="order in orders" :key="order.id").q-pa-md.col-md-12.col-xs-12
    SupplyOrderRequest(:request="order")
</template>
