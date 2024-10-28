<template lang="pug">
div.q-pa-md
  q-card(bordered flat round class="cooperative-card" style="border-radius: 20px;")
    div.row
      DepositButton.col-6
      WithdrawButton.col-6
    div.flex.justify-between
      AutoAvatar(style="width: 60px;" :username="currentUser.username").q-pa-sm.q-pt-lg
      div.text-right.q-pa-sm
        p VIRTUAL

    div.q-pa-sm
      div.text-subtitle1 {{formattedUsername}}
      div 01/2106
      div.text-subtitle2 {{displayName}}

  div
    div.q-pa-md
      div.flex


      div.row.justify-between.q-mt-lg
        div.col-md-4.col-xs-12
          WalletBalance
        div.col-md-4.col-xs-12.q-mt-lg

</template>

<script lang="ts" setup>
import { WalletBalance } from 'src/entities/Wallet/ui'
import { DepositButton } from 'src/features/Wallet/DepositToWallet'
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet'
import { AutoAvatar } from 'src/shared/ui/AutoAvatar';

import { useCurrentUserStore } from 'src/entities/User'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/shared/lib/types/user/IUserData';
import { computed } from 'vue';
const currentUser = useCurrentUserStore()

const userType = computed(() => currentUser.userAccount?.type)

const formattedUsername = computed(() => {
  return currentUser.username.replace(/(.{3})/g, '$1 ').trim();
});

const individualProfile = computed(() => {
  if (userType.value === 'individual') {
    return currentUser.userAccount?.private_data as IIndividualData
  }
  return null
})

const entrepreneurProfile = computed(() => {
  if (userType.value === 'entrepreneur') {
    return currentUser.userAccount?.private_data as IEntrepreneurData
  }
  return null
})

const organizationProfile = computed(() => {
  if (userType.value === 'organization') {
    return currentUser.userAccount?.private_data as IOrganizationData
  }
  return null
})

const userProfile = computed(() => {
  if (userType.value === 'individual' || userType.value === 'entrepreneur') {
    return individualProfile?.value || entrepreneurProfile?.value
  }
  return organizationProfile?.value
})

const displayName = computed(() => {
  if (userType.value === 'individual') {
    return `${individualProfile.value?.last_name} ${individualProfile.value?.first_name} ${individualProfile.value?.middle_name}`
  } else if (userType.value === 'entrepreneur') {
    return `${entrepreneurProfile.value?.last_name} ${entrepreneurProfile.value?.first_name} ${entrepreneurProfile.value?.middle_name}`
  } else {
    return organizationProfile.value?.short_name
  }
})

const inn_ogrn = computed(() => {
  if (organizationProfile.value)
    return `${organizationProfile.value.details.inn} / ${organizationProfile.value.details.ogrn}`
  else return ''
})
defineProps({
  username: {
    type: String,
    required: true,
  },
})

</script>
<style lang="scss" scoped>
.cooperative-card {
  max-width: 400px;
  width: 100%;
}
</style>
