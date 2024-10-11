<template lang="pug">
div(flat bordered).q-pa-md
  p.text-h6 Изменить персональные реквизиты

  p Указанные ниже реквизиты используются кооперативом для возврата паевых взносов пайщику.

  q-list.full-width
    q-item(v-for="(method, index) in wallet.methods" :key="method.method_id").full-width
      q-card(flat).full-width
        div(v-if="method.method_type ==='sbp' && isSBPData(method.data)")
          div(style="max-width: 300px").flex.justify-between

            span
              span {{ index + 1}}.
              span(v-if="method.method_type ==='sbp'").q-pl-xs СБП
            DeletePaymentButton(:size="'xs'" :username="username" :method_id="method.method_id")


            q-input(v-model="method.data.phone" label="Номер телефона" standout="bg-teal text-white" readonly).full-width

        div(style="max-width: 300px" v-if="method.method_type ==='bank_transfer' && isBankTransferData(method.data)")
          div.flex.justify-between
            span
              span {{ index + 1 }}.
              span(v-if="method.method_type ==='bank_transfer'").q-pl-xs Банковский перевод
            DeletePaymentButton(:size="'xs'" :username="username" :method_id="method.method_id")

          div
            q-select(
              v-model="method.data.currency"
              readonly
              label="Валюта счёта"
              standout="bg-teal text-white"
              :options="[{ label: 'RUB', value: 'RUB' }]"
              emit-value
              map-options
            )

            q-input(
              v-model="method.data.bank_name"
              readonly
              standout="bg-teal text-white"
              label="Наименование банка"
              autocomplete="off"
            )

            q-input(
              v-model="method.data.details.corr"
              standout="bg-teal text-white"
              readonly
              mask="####################"
              label="Корреспондентский счет"
              autocomplete="off"
            )

            q-input(
              v-model="method.data.details.bik"
              readonly
              standout="bg-teal text-white"
              mask="#########"
              label="БИК"
              autocomplete="off"
            )

            q-input(
              v-model="method.data.details.kpp"
              readonly
              standout="bg-teal text-white"
              mask="#########"
              label="КПП"
              autocomplete="off"
            )

            q-input(
              v-model="method.data.account_number"
              standout="bg-teal text-white"
              readonly
              mask="####################"
              label="Номер счета"
              autocomplete="off"
            )
    AddPaymentMethodButton(:username="username")


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

wallet.loadUserWalet({ coopname: COOPNAME, username: username.value })

function isSBPData(data: ISBPData | IBankTransferData): data is ISBPData {
  return (data as ISBPData).phone !== undefined;
}

function isBankTransferData(data: ISBPData | IBankTransferData): data is IBankTransferData {
  return (data as IBankTransferData).account_number !== undefined;
}


</script>
