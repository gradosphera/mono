<script lang="ts" setup>
import { useRequestStore } from 'src/entities/Request/model/stores'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RequestCard } from 'src/widgets/Marketplace/RequestCard'
import { OfferPage } from 'src/pages/Marketplace/OfferPage'

import type { IRequestData } from 'src/entities/Request'
const requestsStore = useRequestStore()
const route = useRoute()
const router = useRouter()

const coopname = computed(() => route.params.coopname)
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)


requestsStore.loadUserParentOffers({
  coopname: coopname.value as string,
  username: username.value as string,
})

const currentUserRequestId = computed(() => route.params.id)
const userParentOffers = computed(() => requestsStore.userParentOffers)

const currentUserParentOffer = computed(() =>
  userParentOffers.value.find((obj) => Number(obj.id) === Number(currentUserRequestId.value))
)
const showUserOffer = (offer: IRequestData) => {
  router.push({ name: 'marketplace-user-offer-id', params: { id: offer.id } })
}
</script>

<template lang="pug">
div
  div(v-if="!currentUserParentOffer").row
    div(v-for="offer in userParentOffers" :key="offer.id").q-pa-md.col-md-3.col-xs-12
      RequestCard(:request="offer" style="border: 1px solid grey;" @click="showUserOffer(offer)").card

  div(v-if="currentUserParentOffer")
    OfferPage( :object="currentUserParentOffer").col-md-3.col-xs-12

</template>
