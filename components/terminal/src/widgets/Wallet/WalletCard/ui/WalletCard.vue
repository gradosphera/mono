<template lang="pug">
q-card(flat bordered).q-pa-md
  div.row
    div.col-md-6.col-xs-12.q-gutter-sm
      div.flex.q-pa-sm
        DepositButton.q-ma-sm
        WithdrawButton.q-ma-sm
    div.col-md-6.col-xs-12.q-gutter-sm
      WalletBalance
  WalletProgramsList
</template>


<script lang="ts" setup>
import { WalletBalance } from 'src/entities/Wallet/ui'
import { useWalletStore } from 'src/entities/Wallet/model/stores'
import { DepositButton } from 'src/features/Wallet/DepositToWallet'
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet'
import { WalletProgramsList } from 'src/entities/Wallet/ui'
import { COOPNAME } from 'src/shared/config'
import { computed, onBeforeUnmount } from 'vue'

const wallet = useWalletStore()

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const username = computed(() => props.username)

const update = () => {
  wallet.update({ coopname: COOPNAME, username: username.value })
}

update()

const interval = setInterval(() => {
  update()
}, 3000)

onBeforeUnmount(() => {
  clearInterval(interval)
})
</script>
