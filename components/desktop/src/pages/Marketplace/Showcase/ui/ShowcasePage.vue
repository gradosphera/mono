<script lang="ts" setup>
import { useRequestStore } from 'src/entities/Request/model/stores'
import { RequestCard } from 'src/widgets/Marketplace/RequestCard'
import { OfferPage } from 'src/pages/Marketplace/OfferPage'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const requestsStore = useRequestStore()
const route = useRoute()

import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)

const coopname = computed(() => route.params.coopname)

requestsStore.loadAllParentOffers({ coopname: coopname.value as string })

const currentOfferId = computed(() => route.params.id)

const offers = computed(() => requestsStore.getAllPublishedParentOffers())

const currentOffer = computed(() =>
  offers.value.find((obj: any) => obj.id == Number(currentOfferId.value))
)

const showOffer = (offer: any) => {
  if (username.value != offer.username)
    router.push({ name: 'marketplace-showcase-id', params: { id: offer.id } })
  else router.push({ name: 'marketplace-user-offer-id', params: { id: offer.id } })
}
</script>

<template lang="pug">
div
  div(v-if="!currentOffer").row
    div(v-for="offer in offers" :key="offer.id").q-pa-md.col-md-3.col-xs-12
      RequestCard(:request="offer" style="border: 1px solid grey;" @click="showOffer(offer)").card
  div(v-if="currentOffer")
    OfferPage( :object="currentOffer").col-md-3.col-xs-12
</template>
