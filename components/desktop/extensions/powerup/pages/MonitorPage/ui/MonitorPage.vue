<template lang="pug">
div.monitor-page
  // Ресурсные карточки в ряд
  .resources-row
    .resources-container
      .resource-col
        CpuResourceWidget
      .resource-col
        NetResourceWidget
      .resource-col
        RamResourceWidget

  // Кошелек AXON
  div(style="margin-top: 50px;")
    .row.justify-center
      .col-xs-12.col-sm-6.col-md-5.q-pa-md
        AxonWalletCard
      .col-xs-12.col-sm-6.col-md-5.q-pa-md
        ResourceInfoWidget

</template>

<style lang="scss" scoped>
.monitor-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.resources-row {
  .resources-container {
    display: flex;
    justify-content: space-around;
    gap: 2rem;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
    }
  }

  .resource-col {
    flex: 0 0 auto;
    max-width: 320px;
    width: 100%;

    @media (max-width: 1024px) {
      max-width: 100%;
    }
  }
}
</style>

<script lang="ts" setup>
import CpuResourceWidget from '../../../widgets/CpuResourceWidget'
import NetResourceWidget from '../../../widgets/NetResourceWidget'
import RamResourceWidget from '../../../widgets/RamResourceWidget'
import ResourceInfoWidget from '../../../widgets/ResourceInfoWidget'
import AxonWalletCard from '../../../widgets/AxonWalletCard'
</script>
