<script lang="ts" setup>
import { computed } from 'vue'
import { CreateParentOfferForm } from 'src/features/Request/CreateParentOffer'
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)
import { COOPNAME } from 'src/shared/config';

</script>
<template lang="pug">
div.row.justify-center
  CreateParentOfferForm(:username="username" :coopname="COOPNAME").col-md-4.col-xs-12.q-mt-md.q-mb-lg
</template>
