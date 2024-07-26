<template lang="pug">
div
  q-tabs( v-model="tab" dense switch-indicator inline-label outside-arrows mobile-arrows align="justify" active-bg-color="teal" active-color="white" indicator-color="secondary" style="border-bottom: 1px solid teal;")
    q-tab(name="Удостоверение" label="Удостоверение")
    q-tab(name="Кошелёк" label="Кошелёк")
    q-tab(name="Реквизиты" label="Реквизиты")

  q-tab-panels(
    swipeable
    v-model="tab"
    animated
    transition-prev="fade"
    transition-next="fade"
    style="background: none !important; min-height: 85vh;"
  )
    q-tab-panel(name="Удостоверение")
      PersonalCard(:username="username")

    q-tab-panel(name="Кошелёк")
      WalletCard(:username="username")

    q-tab-panel(name="Реквизиты")
      PaymentMethodsCard(:username="username")

</template>
<script lang="ts" setup>
// import { CompositeWalletCard } from 'src/widgets/Wallet';
import { PaymentMethodsCard } from 'src/widgets/Wallet/PaymentMethods';
import { PersonalCard } from 'src/widgets/Wallet/PersonalCard/ui'
import { WalletCard } from 'src/widgets/Wallet/WalletCard'

import { computed, ref } from 'vue';
import { useCurrentUserStore } from 'src/entities/User';

const currentUser = useCurrentUserStore()

const username = computed(() => currentUser.username)

const tab = ref('Удостоверение')

</script>
