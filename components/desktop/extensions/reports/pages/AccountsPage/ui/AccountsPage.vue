<template lang="pug">
div.page-shell
  q-card.q-mt-md(flat)
    q-table.full-height(
      flat
      :grid='isMobile'
      :rows='accounts'
      :columns='columns'
      row-key='id'
      :pagination='pagination'
      :loading='loading'
      :no-data-label='"План счетов не найден"'
    )
      template(#header='props')
        q-tr(:props='props')
          q-th(v-for='col in props.cols' :key='col.name' :props='props') {{ col.label }}

      template(#body='props')
        q-tr(:key='`acc_${props.row.id}`' :props='props')
          q-td(auto-width)
            ExpandToggleButton(
              :expanded='expanded.has(props.row.id)'
              @click='toggleExpand(props.row.id)'
            )
          q-td
            AccountIdCell(:account-code='Math.round(props.row.id / 1000)')
          q-td {{ props.row.name }}
          q-td.text-right {{ formatAsset2Digits(props.row.debitBalance) }}
          q-td.text-right {{ formatAsset2Digits(props.row.creditBalance) }}
          q-td.text-right.text-weight-bold {{ formatAsset2Digits(props.row.balance) }}
          q-td
            span.text-weight-medium(
              :class='props.row.accountType === 0 ? "text-blue-grey-8" : "text-brown-7"'
            ) {{ props.row.accountType === 0 ? 'Активный' : 'Пассивный' }}

        q-tr.q-virtual-scroll--with-prev(
          no-hover
          v-if='expanded.has(props.row.id)'
          :key='`exp_acc_${props.row.id}`'
          :props='props'
        )
          q-td(colspan='100%')
            .q-pa-sm
              .row.items-center.q-mb-sm
                .col
                  .text-caption.text-grey-6 История проводок
                .col-auto
                  q-btn(
                    flat dense size='sm' color='primary'
                    icon='fa-solid fa-arrow-right'
                    label='Все операции'
                    :to='{ name: "reports-operations", query: { account_id: props.row.id } }'
                  )
              q-table(
                flat dense
                :rows='childOps.get(props.row.id) ?? []'
                :columns='childColumns'
                row-key='globalSequence'
                hide-pagination
                :pagination='{ rowsPerPage: 0 }'
                :loading='childLoading.has(props.row.id)'
                no-data-label='Проводок нет'
              )
                template(#body-cell-action='cp')
                  q-td(:props='cp')
                    span.text-weight-medium(
                      :class='cp.row.action === "debit" ? "text-blue-grey-8" : "text-brown-7"'
                    ) {{ cp.row.action === 'debit' ? 'Дебет' : 'Кредит' }}
                template(#body-cell-quantity='cp')
                  q-td.text-right(:props='cp') {{ cp.row.quantity ? formatAsset2Digits(cp.row.quantity) : '—' }}
                template(#body-cell-createdAt='cp')
                  q-td(:props='cp') {{ formatDate(cp.row.createdAt) }}
                template(#body-cell-open='cp')
                  q-td.text-right(:props='cp')
                    q-btn(
                      v-if='cp.row.processHash'
                      flat dense round size='sm' color='primary'
                      icon='fa-solid fa-up-right-from-square'
                      :to='{ name: "reports-operations", query: { process_hash: cp.row.processHash } }'
                    )
                      q-tooltip Показать операцию

      template(#item='props')
        .col-12
          q-card.q-pa-md.q-mb-sm
            .row.items-center.q-gutter-x-md
              .col
                .text-h6.font-monospace {{ displayId(props.row.id) }}
                .text-body2 {{ props.row.name }}
                .text-caption.q-mt-xs.text-weight-medium(
                  :class='props.row.accountType === 0 ? "text-blue-grey-8" : "text-brown-7"'
                ) {{ props.row.accountType === 0 ? 'Активный' : 'Пассивный' }}
              .col-auto
                q-btn(
                  flat dense size='sm' color='primary'
                  icon='fa-solid fa-list-ul'
                  :to='{ name: "reports-operations", query: { account_id: props.row.id } }'
                )
                  q-tooltip Журнал проводок
            .row.q-mt-sm
              .col-4
                .text-caption.text-grey-6 Дебет
                .text-body2 {{ formatAsset2Digits(props.row.debitBalance) }}
              .col-4
                .text-caption.text-grey-6 Кредит
                .text-body2 {{ formatAsset2Digits(props.row.creditBalance) }}
              .col-4
                .text-caption.text-grey-6 Сальдо
                .text-body2.text-weight-bold {{ formatAsset2Digits(props.row.balance) }}
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWindowSize } from 'src/shared/hooks'
import { formatAsset2Digits } from 'src/shared/lib/utils'
import { useSystemStore } from 'src/entities/System/model'
import { useLedger2Store, type ILedger2Account, type ILedger2Operation } from 'src/entities/Ledger2'
import { FailAlert } from 'src/shared/api'
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton'
import { AccountIdCell } from '../../../shared/ui'

const { info } = useSystemStore()
const { isMobile } = useWindowSize()
const ledger2Store = useLedger2Store()

const loading = ref(false)
const pagination = ref({ rowsPerPage: 0 })
const accounts = ref<ILedger2Account[]>([])

const expanded = ref(new Set<number>())
const childOps = ref(new Map<number, ILedger2Operation[]>())
const childLoading = ref(new Set<number>())

function displayId(id: number): string {
  return String(Math.round(id / 1000))
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const columns: any[] = [
  { name: 'expand', align: 'left', label: '', field: 'expand', sortable: false },
  { name: 'id', align: 'left', label: 'Счёт', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Наименование', field: 'name', sortable: true },
  { name: 'debit', align: 'right', label: 'Дебет', field: 'debitBalance', sortable: true },
  { name: 'credit', align: 'right', label: 'Кредит', field: 'creditBalance', sortable: true },
  { name: 'balance', align: 'right', label: 'Сальдо', field: 'balance', sortable: true },
  { name: 'accountType', align: 'left', label: 'Тип', field: 'accountType', sortable: true },
]

const childColumns: any[] = [
  { name: 'action', align: 'left', label: 'Тип', field: 'action' },
  { name: 'quantity', align: 'right', label: 'Сумма', field: 'quantity' },
  { name: 'createdAt', align: 'left', label: 'Дата', field: 'createdAt' },
  { name: 'open', align: 'right', label: '', field: 'processHash' },
]

async function toggleExpand(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
    return
  }
  expanded.value.add(id)
  if (childOps.value.has(id)) return
  childLoading.value.add(id)
  try {
    const resp = await ledger2Store.loadHistory({
      coopname: info.coopname,
      accountId: id,
      actionNames: ['debit', 'credit'],
      limit: 20,
      sortOrder: 'DESC',
    })
    childOps.value.set(id, resp?.items ?? [])
  } catch (e) {
    FailAlert(e)
  } finally {
    childLoading.value.delete(id)
  }
}

onMounted(async () => {
  try {
    loading.value = true
    accounts.value = await ledger2Store.loadAccounts(info.coopname)
  } catch (e) {
    FailAlert(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.font-monospace {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.03em;
}
</style>
