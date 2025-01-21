<script lang="ts" setup>
import { computed } from 'vue'
import { CreateParentOfferForm } from 'src/features/Request/CreateParentOffer'
import { useSessionStore } from 'src/entities/Session'
import { useSystemStore } from 'src/entities/System/model'
const session = useSessionStore()
const username = computed(() => session.username)
const { info } = useSystemStore()
</script>
<template lang="pug">
div.row.justify-center
  CreateParentOfferForm(:username="username" :coopname="info.coopname").col-md-4.col-xs-12.q-mt-md.q-mb-lg
</template>
