<script setup lang="ts">
import { useWalletStore } from '../../model'
const walletStore = useWalletStore()
</script>

<template lang="pug">
div.row.flex.justify-around.q-pa-sm
  div.q-mt-md
    span.text-grey Паевый счёт
    p.text-h3 {{ walletStore.wallet.available }}

  div.q-mt-md.text-right
    span.text-grey Членский счёт
    p.text-h3 {{ walletStore.wallet.blocked }}

</template>
