<template lang="pug">
div
  q-tabs( v-model="tab" dense switch-indicator inline-label outside-arrows mobile-arrows align="justify" active-bg-color="teal" active-color="white" indicator-color="secondary" style="border-bottom: 1px solid teal;")
    q-tab(name="Кошелёк" label="Кошелёк")

  q-tab-panels(
    v-model="tab"
    animated
    transition-prev="fade"
    transition-next="fade"
    style="background: none !important;"
  )

    q-tab-panel(name="Кошелёк")
      CompositeWalletCard


</template>
<script lang="ts" setup>
import { CompositeWalletCard } from 'src/widgets/Wallet';

import { ref } from 'vue';

const tab = ref('Кошелёк')

</script>
