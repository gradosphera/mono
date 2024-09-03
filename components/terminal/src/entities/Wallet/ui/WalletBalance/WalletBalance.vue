<script setup lang="ts">
import { useWalletStore } from '../../model'
const walletStore = useWalletStore()
</script>

<template lang="pug">
div
q-input(readonly standout label="Паевый счёт" v-model="walletStore.wallet.available" style="font-size: 18px;")
q-input(readonly standout label="Членский счёт" v-model="walletStore.wallet.blocked" style="font-size: 18px;")

</template>
