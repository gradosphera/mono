<template lang="pug">
div.q-pa-md
  div.row
    div.col-md-12.col-xs-12
      q-card(flat class="card-container q-pa-md")
        div.row.items-center.q-mb-md
          div.col-12
            div.text-h4.q-mb-xs Кошелёк
            q-badge(color="primary" class="user-role") {{ role }}

        div.row.q-mb-md
          div.col-12
            div.info-card
              div.card-title Неснижаемый остаток
              div.card-label Заблокировано
              div.card-value {{ currentUser.participantAccount?.minimum_amount || '0' }}

        div.row
          div.col-12
            div.text-h6.q-mb-sm Целевые Программы

        div.row
          div.col-6.q-pr-sm
            DepositButton.full-width.card-action-btn
          div.col-6.q-pl-sm
            WithdrawButton.full-width.card-action-btn

        div.row.q-mb-md
          div.col-12
            div
              div.info-card.hover(v-for="program_wallet of walletStore.program_wallets" :key="program_wallet.id")
                div.card-title {{ program_wallet.program_details.title }}
                div.row
                  div.col-6
                    div.card-label Доступно
                    div.card-value {{program_wallet.available || '0'}}
                  div.col-6
                    div.card-label Заблокировано
                    div.card-value {{program_wallet.blocked || '0'}}

</template>

<script lang="ts" setup>
import { DepositButton } from 'src/features/Wallet/DepositToWallet';
import { WithdrawButton } from 'src/features/Wallet/WithdrawFromWallet';
import { useWalletStore } from 'src/entities/Wallet';
import { useCurrentUserStore } from 'src/entities/User';
import { computed } from 'vue';
import 'src/shared/ui/CardStyles/index.scss';

const walletStore = useWalletStore();
const currentUser = useCurrentUserStore();



const role = computed(() => {
  if (currentUser.userAccount?.role === 'user')
    return 'Пайщик';
  else if (currentUser.userAccount?.role === 'member')
    return 'Член совета';
  else if (currentUser.userAccount?.role === 'chairman')
    return 'Председатель совета';
  else return '';
});
</script>

<style lang="scss" scoped>
.user-role {
  font-size: 14px;
  padding: 4px 8px;
}
</style>
