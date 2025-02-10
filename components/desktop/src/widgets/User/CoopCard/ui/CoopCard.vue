<template lang="pug">
div.q-pa-md
  div.row
    div.col-md-12.col-xs-12
      q-card(flat round class="cooperative-card" style="border-radius: 20px;")
        div.q-pa-sm.row.items-center.q-pa-md
          div.col-12.col-md-3.flex.justify-center
            AutoAvatar(style="width: 60px; border-radius: 50%;" :username="currentUser.username")
          div.col-12.col-md-9.q-mt-sm.q-mt-md-0
            q-badge(color="primary" style="font-size: 12px; margin-bottom: 4px;") {{role}}
            div.text-h6
              span(v-if="isIP").q-mr-sm ИП
              | {{displayName}}
        div.row
          DepositButton.col-6.border-left-radius-buttons
          WithdrawButton.col-6.border-right-radius-buttons

          div.col-md-4.col-xs-12


      q-list(flat).q-gutter-sm
        q-item
          q-item-section
            q-item-label(caption) Имя аккаунта
            q-item-label(style="font-size: 20px;").text-bold {{ currentUser.username }}

        //- q-item
        //-   q-item-section
        //-     q-item-label(caption) Паевый счёт
        //-     q-item-label(style="font-size: 20px;").text-bold {{ walletStore.wallet.available }}

        q-item
          q-item-section
            q-item-label(caption) Минимальный паевый счёт
            q-item-label(style="font-size: 20px;").text-bold {{ currentUser.participantAccount?.minimum_amount }}

        //- q-item
        //-   q-item-section
        //-     q-item-label(caption) Заблокировано в целевых программах
        //-     q-item-label(style="font-size: 20px;").text-bold {{ walletStore.wallet.blocked }}


        q-item(v-for="program_wallet of walletStore.program_wallets" :key="program_wallet.id")
          q-item-section
            q-item-label(caption) {{ program_wallet.program_details.title }}

            q-item-label(style="font-size: 20px;").text-bold {{program_wallet.available}}




    //- div.col-md-6.col-xs-12.q-mt-lg


</template>

<script lang="ts" setup>

import { DepositButton } from 'src/features/Wallet/DepositToWallet'
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet'
import { AutoAvatar } from 'src/shared/ui/AutoAvatar';
import { useWalletStore } from 'src/entities/Wallet';
const walletStore = useWalletStore()

import { useCurrentUserStore } from 'src/entities/User'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/shared/lib/types/user/IUserData';
import { computed } from 'vue';
const currentUser = useCurrentUserStore()

const userType = computed(() => currentUser.userAccount?.type)

const isIP = computed(() => currentUser.userAccount?.type === 'entrepreneur')


const role = computed(() => {
  if (currentUser.userAccount?.role === 'user')
    return 'Пайщик'
  else if (currentUser.userAccount?.role === 'member')
    return 'Член совета'
  else if (currentUser.userAccount?.role === 'chairman')
    return 'Председатель совета'
  else return ''
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
