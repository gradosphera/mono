<template lang="pug">
div.q-pa-md
  div.row
    div.col-md-12.col-xs-12
      q-card(flat round class="cooperative-card" style="border-radius: 20px;")
        div.q-pa-sm.row.items-center.q-pa-md
          div.col-12.col-md-3.flex.justify-center
            AutoAvatar(style="width: 60px; border-radius: 50%;" :username="currentUser.username")
          div.col-12.col-md-9.q-mt-sm.q-mt-md-0
            q-badge(color="primary" style="font-size: 12px; margin-bottom: 4px;") Председатель совета
            div.text-h6 {{displayName}}
        div.row
          DepositButton.col-6.border-left-radius-buttons
          WithdrawButton.col-6.border-right-radius-buttons

      WalletBalance.q-mt-lg


    //- div.col-md-6.col-xs-12.q-mt-lg


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

// const userProfile = computed(() => {
//   if (userType.value === 'individual' || userType.value === 'entrepreneur') {
//     return individualProfile?.value || entrepreneurProfile?.value
//   }
//   return organizationProfile?.value
// })

const displayName = computed(() => {
  if (userType.value === 'individual') {
    return `${individualProfile.value?.last_name} ${individualProfile.value?.first_name} ${individualProfile.value?.middle_name}`
  } else if (userType.value === 'entrepreneur') {
    return `${entrepreneurProfile.value?.last_name} ${entrepreneurProfile.value?.first_name} ${entrepreneurProfile.value?.middle_name}`
  } else {
    return organizationProfile.value?.short_name
  }
})

// const inn_ogrn = computed(() => {
//   if (organizationProfile.value)
//     return `${organizationProfile.value.details.inn} / ${organizationProfile.value.details.ogrn}`
//   else return ''
// })

</script>
<style lang="scss" scoped>
.cooperative-card {
  max-width: 400px;
  width: 100%;
}

.border-left-radius-buttons {
  border-top-left-radius: 0px !important;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  border-bottom-left-radius: 20px !important;
}

.border-right-radius-buttons {
  border-top-right-radius: 0px !important;
  border-top-left-radius: 0px !important;
  border-bottom-right-radius: 20px !important;
  border-bottom-left-radius: 0px !important;
}
</style>
