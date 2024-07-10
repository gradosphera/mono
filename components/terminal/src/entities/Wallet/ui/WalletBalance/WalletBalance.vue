<script setup lang="ts">
import { useWalletStore } from '../../model'
const walletStore = useWalletStore()
</script>

<template lang="pug">
div.row.flex.justify-between.q-pa-sm
  div
    span.text-grey Паевый счёт
    p {{ walletStore.wallet.available }}

  div.text-right
    span.text-grey Членский счёт
    p {{ walletStore.wallet.blocked }}

</template>
