<template lang="pug">
q-card(flat bordered).q-pa-md
  AddPaymentMethodButton(:username="username")
  q-list.full-width.q-mt-lg
    q-item(v-for="method in wallet.methods" :key="method.method_id").q-mt-md.full-width
      q-card(flat).full-width
        div(v-if="method.method_type ==='sbp' && isSBPData(method.data)")
          div.flex.justify-between

            q-badge
              span №{{ method.method_id }}
              span(v-if="method.method_type ==='sbp'").q-pl-xs СБП
            DeletePaymentButton(:size="'xs'" :username="username" :method_id="method.method_id")
          q-input(v-model="method.data.phone" label="Номер телефона" filled readonly)

        div(v-if="method.method_type ==='bank_transfer' && isBankTransferData(method.data)")
          div.flex.justify-between
            q-badge
              span №{{ method.method_id }}
              span(v-if="method.method_type ==='bank_transfer'").q-pl-xs Банковский перевод
            DeletePaymentButton(:size="'xs'" :username="username" :method_id="method.method_id")


          q-select(
            v-model="method.data.currency"
            readonly
            label="Валюта счёта"
            filled
            :options="[{ label: 'RUB', value: 'RUB' }]"
            emit-value
            map-options
          )

          q-input(
            v-model="method.data.bank_name"
            readonly
            filled
            label="Наименование банка"
            autocomplete="off"
          )

          q-input(
            v-model="method.data.details.corr"
            filled
            readonly
            mask="####################"
            label="Корреспондентский счет"
            autocomplete="off"
          )

          q-input(
            v-model="method.data.details.bik"
            readonly
            filled
            mask="#########"
            label="БИК"
            autocomplete="off"
          )

          q-input(
            v-model="method.data.details.kpp"
            readonly
            filled
            mask="#########"
            label="КПП"
            autocomplete="off"
          )

          q-input(
            v-model="method.data.account_number"
            filled
            readonly
            mask="####################"
            label="Номер счета"
            autocomplete="off"
          )

</template>

<script lang="ts" setup>
import { useWalletStore } from 'src/entities/Wallet';
import { COOPNAME } from 'src/shared/config';
import { computed } from 'vue';
import { AddPaymentMethodButton } from 'src/features/Wallet/AddPaymentMethod';
import type { IBankTransferData, ISBPData } from 'src/features/Wallet/AddPaymentMethod/model';
import { DeletePaymentButton } from 'src/features/Wallet/DeletePaymentMethod/ui';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const wallet = useWalletStore()

const username = computed(() => props.username)

wallet.update({ coopname: COOPNAME, username: username.value })

function isSBPData(data: ISBPData | IBankTransferData): data is ISBPData {
  return (data as ISBPData).phone !== undefined;
}

function isBankTransferData(data: ISBPData | IBankTransferData): data is IBankTransferData {
  return (data as IBankTransferData).account_number !== undefined;
}


</script>
