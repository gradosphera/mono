<template lang="pug">
div(flat bordered).q-pa-md
  p Указанные реквизиты используются при платежах от кооператива в пользу пайщика.

  AddPaymentMethodButton(:username="username")

  q-list.separator.q-mt-lg
    q-item(
      v-for="(method, index) in wallet.methods"
      :key="method.method_id"
    ).q-gutter-md.q-pa-md
      q-item-section(side top)
        span.text-bold {{ index + 1 }}.
      q-item-section
        div.flex.items-center.q-mb-sm
          span.text-subtitle {{ method.method_type === 'sbp' ? 'Система Быстрых Платежей' : 'Банковские перевод' }}

        div(v-if="method.method_type === 'sbp' && isSBPData(method.data)")
          q-item-label
            span.text-caption.text-grey Телефон:&nbsp;
            span.text-body2 {{ method.data.phone }}

        div(v-if="method.method_type === 'bank_transfer' && isBankTransferData(method.data)")
          q-item-label
            span.text-caption.text-grey Валюта:&nbsp;
            span.text-body2 {{ method.data.currency }}

          q-item-label
            span.text-caption.text-grey Банк:&nbsp;
            span.text-body2 {{ method.data.bank_name }}

          q-item-label
            span.text-caption.text-grey Корр. счет:&nbsp;
            span.text-body2 {{ method.data.details.corr }}

          q-item-label
            span.text-caption.text-grey БИК:&nbsp;
            span.text-body2 {{ method.data.details.bik }}

          q-item-label
            span.text-caption.text-grey КПП:&nbsp;
            span.text-body2 {{ method.data.details.kpp }}

          q-item-label
            span.text-caption.text-grey Счет:&nbsp;
            span.text-body2 {{ method.data.account_number }}

        DeletePaymentButton(:size="'xs'" :username="username" :method_id="method.method_id")

</template>


<script lang="ts" setup>
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { computed } from 'vue';
import { AddPaymentMethodButton } from 'src/features/PaymentMethod/AddPaymentMethod';
import type { IBankTransferData, ISBPData } from 'src/features/PaymentMethod/AddPaymentMethod/model';
import { DeletePaymentButton } from 'src/features/PaymentMethod/DeletePaymentMethod/ui';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const wallet = useWalletStore()

const username = computed(() => props.username)

wallet.loadUserWalet({ coopname: info.coopname, username: username.value })

function isSBPData(data: ISBPData | IBankTransferData): data is ISBPData {
  return (data as ISBPData).phone !== undefined;
}

function isBankTransferData(data: ISBPData | IBankTransferData): data is IBankTransferData {
  return (data as IBankTransferData).account_number !== undefined;
}


</script>
