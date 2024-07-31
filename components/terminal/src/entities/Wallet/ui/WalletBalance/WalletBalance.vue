<script setup lang="ts">
import { useWalletStore } from '../../model'
const walletStore = useWalletStore()
</script>

<template lang="pug">
div
  q-input(readonly standout label="Паевый счёт" v-model="walletStore.wallet.available")
  //- span.text-grey Паевый счёт
  //- p.text-h3 {{ walletStore.wallet.available }}


  q-input(readonly standout label="Членский счёт" v-model="walletStore.wallet.blocked")


</template>
