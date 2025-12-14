<template lang="pug">
div.connection-dashboard
  //- Основная информация
  .row.q-mb-lg
    //- Карточка баланса AXON
    .col-12.col-md-4
      AxonWallet

    //- Карточка домена
    .col-12.col-md-6
      DomainCard

      SubscriptionsCard



</template>

<script setup lang="ts">
import { AxonWallet, DomainCard, SubscriptionsCard } from './index'

</script>

<style lang="scss" scoped>
.connection-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

