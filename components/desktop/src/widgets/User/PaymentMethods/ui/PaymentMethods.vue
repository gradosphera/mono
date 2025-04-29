<template lang="pug">
div.q-pa-md
  q-card(flat class="card-container q-pa-md")
    div.row.items-center
      div.col-12
        div.text-h4.q-mb-sm Способы получения платежей
        p.q-mb-md Указанные реквизиты используются при платежах от кооператива в пользу пайщика

    div.row.q-mb-md
      div.col-12
        AddPaymentMethodButton(:username="username").full-width.card-action-btn

    div.row
      div.col-12
        div(v-if="wallet.methods && wallet.methods.length > 0")
          div.info-card.hover(
            v-for="(method, index) in wallet.methods"
            :key="method.method_id"
            class="q-mb-md"
          )
            div.row.items-start
              div.col-auto.q-mr-sm
                q-badge(color="primary" outline) {{ index + 1 }}
              div.col
                div.card-title {{ method.method_type === 'sbp' ? 'Система Быстрых Платежей' : 'Банковский перевод' }}

                div.q-mb-md(v-if="method.method_type === 'sbp' && isSBPData(method.data)")
                  div.q-my-sm
                    span.card-label Телефон:
                    span.card-value {{ method.data.phone }}

                div.q-mb-md(v-if="method.method_type === 'bank_transfer' && isBankTransferData(method.data)")
                  div.row.q-col-gutter-md
                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label Валюта
                        div.card-value {{ method.data.currency }}

                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label Банк
                        div.card-value {{ method.data.bank_name }}

                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label Счет
                        div.card-value {{ method.data.account_number }}

                  div.row.q-col-gutter-md
                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label Корр. счет
                        div.card-value {{ method.data.details.corr }}

                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label БИК
                        div.card-value {{ method.data.details.bik }}

                    div.col-12.col-md-4
                      div.q-my-sm
                        div.card-label КПП
                        div.card-value {{ method.data.details.kpp }}

                div.row.justify-end
                  DeletePaymentButton(
                    :size="'sm'"
                    :username="username"
                    :method_id="method.method_id"
                    flat
                    class="card-action-btn"
                  )

        div.q-pa-md.text-center(v-else)
          p.text-grey У вас еще не добавлены способы получения платежей
</template>


<script lang="ts" setup>
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { computed } from 'vue';
import { AddPaymentMethodButton } from 'src/features/PaymentMethod/AddPaymentMethod';
import type { IBankTransferData, ISBPData } from 'src/features/PaymentMethod/AddPaymentMethod/model';
import { DeletePaymentButton } from 'src/features/PaymentMethod/DeletePaymentMethod/ui';
import 'src/shared/ui/CardStyles/index.scss';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
})

const wallet = useWalletStore()

const username = computed(() => props.username)

wallet.loadUserWallet({ coopname: info.coopname, username: username.value })

function isSBPData(data: ISBPData | IBankTransferData): data is ISBPData {
  return (data as ISBPData).phone !== undefined;
}

function isBankTransferData(data: ISBPData | IBankTransferData): data is IBankTransferData {
  return (data as IBankTransferData).account_number !== undefined;
}
</script>

<style lang="scss" scoped>
// Можно добавить дополнительные стили, если потребуется
</style>
