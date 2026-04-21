<template lang="pug">
div.page-shell
  q-card.q-mt-md(flat)
    q-table.full-height(
      flat
      :grid='isMobile'
      :rows='wallets'
      :columns='columns'
      row-key='id'
      :pagination='pagination'
      :loading='loading'
      :no-data-label='"Кошельки не найдены"'
    )
      template(#header='props')
        q-tr(:props='props')
          q-th(v-for='col in props.cols' :key='col.name' :props='props') {{ col.label }}

      template(#body='props')
        q-tr(:key='`wallet_${props.row.id}`' :props='props')
          q-td(auto-width)
            ExpandToggleButton(
              :expanded='expanded.has(props.row.id)'
              @click='toggleExpand(props.row.id)'
            )
          q-td.font-monospace {{ props.row.id }}
          q-td {{ props.row.name }}
          q-td.text-right {{ formatAsset2Digits(props.row.available) }}
          q-td.text-right {{ formatAsset2Digits(props.row.blocked) }}

        q-tr.q-virtual-scroll--with-prev(
          no-hover
          v-if='expanded.has(props.row.id)'
          :key='`exp_wal_${props.row.id}`'
          :props='props'
        )
          q-td(colspan='100%')
            .q-pa-sm
              .text-caption.text-grey-6.q-mb-xs Движения по кошельку
              q-table(
                flat dense
                :rows='childOps.get(props.row.id) ?? []'
                :columns='childColumns'
                row-key='globalSequence'
                hide-pagination
                :pagination='{ rowsPerPage: 0 }'
                :loading='childLoading.has(props.row.id)'
                no-data-label='Движений нет'
              )
                template(#body-cell-direction='cp')
                  q-td.text-center(:props='cp')
                    q-icon(
                      v-if='directionFor(cp.row, props.row.id) === "in"'
                      name='fa-solid fa-arrow-down'
                      color='positive'
                      size='sm'
                    )
                      q-tooltip Входящее
                    q-icon(
                      v-else-if='directionFor(cp.row, props.row.id) === "out"'
                      name='fa-solid fa-arrow-up'
                      color='negative'
                      size='sm'
                    )
                      q-tooltip Исходящее
                    q-icon(
                      v-else
                      name='fa-solid fa-right-left'
                      color='grey-6'
                      size='sm'
                    )
                      q-tooltip Перевод
                template(#body-cell-walletFrom='cp')
                  q-td(:props='cp')
                    span(:class='{ "text-weight-bold": cp.row.walletFrom === props.row.id }') {{ cp.row.walletFrom ?? '—' }}
                template(#body-cell-walletTo='cp')
                  q-td(:props='cp')
                    span(:class='{ "text-weight-bold": cp.row.walletTo === props.row.id }') {{ cp.row.walletTo ?? '—' }}
                template(#body-cell-quantity='cp')
                  q-td.text-right(:props='cp') {{ cp.row.quantity ? formatAsset2Digits(cp.row.quantity) : '—' }}
                template(#body-cell-createdAt='cp')
                  q-td(:props='cp') {{ formatDate(cp.row.createdAt) }}
              q-btn.q-mt-xs(
                flat dense size='sm' color='primary'
                icon='fa-solid fa-arrow-right'
                label='К операциям'
                :to='{ name: "reports-operations", query: { wallet_id: props.row.id } }'
              )

      template(#item='props')
        .col-12
          q-card.q-pa-md.q-mb-sm
            .row.items-center.q-gutter-x-md
              .col
                .text-body1 {{ props.row.name }}
                .text-caption.text-grey-6.font-monospace ID: {{ props.row.id }}
              .col-auto
                ExpandToggleButton(
                  :expanded='expanded.has(props.row.id)'
                  @click='toggleExpand(props.row.id)'
                )
            .row.q-mt-sm
              .col-6
                .text-caption.text-grey-6 Доступно
                .text-body2.text-weight-medium {{ formatAsset2Digits(props.row.available) }}
              .col-6
                .text-caption.text-grey-6 Заблокировано
                .text-body2.text-weight-medium {{ formatAsset2Digits(props.row.blocked) }}
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWindowSize } from 'src/shared/hooks'
import { formatAsset2Digits } from 'src/shared/lib/utils'
import { useSystemStore } from 'src/entities/System/model'
import { useLedger2Store, type ILedger2Wallet, type ILedger2Operation } from 'src/entities/Ledger2'
import { FailAlert } from 'src/shared/api'
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton'

const { info } = useSystemStore()
const { isMobile } = useWindowSize()
const ledger2Store = useLedger2Store()

const loading = ref(false)
const pagination = ref({ rowsPerPage: 0 })
const wallets = ref<ILedger2Wallet[]>([])

const expanded = ref(new Set<number>())
const childOps = ref(new Map<number, ILedger2Operation[]>())
const childLoading = ref(new Set<number>())

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const columns: any[] = [
  { name: 'expand', align: 'left', label: '', field: 'expand', sortable: false },
  { name: 'id', align: 'left', label: 'ID', field: 'id', sortable: true },
  { name: 'name', align: 'left', label: 'Наименование', field: 'name', sortable: true },
  { name: 'available', align: 'right', label: 'Доступно', field: 'available', sortable: true },
  { name: 'blocked', align: 'right', label: 'Заблокировано', field: 'blocked', sortable: true },
]

const childColumns: any[] = [
  { name: 'direction', align: 'center', label: '', field: 'direction' },
  { name: 'walletFrom', align: 'left', label: 'Из', field: 'walletFrom' },
  { name: 'walletTo', align: 'left', label: 'В', field: 'walletTo' },
  { name: 'quantity', align: 'right', label: 'Сумма', field: 'quantity' },
  { name: 'memo', align: 'left', label: 'Примечание', field: 'memo' },
  { name: 'createdAt', align: 'left', label: 'Дата', field: 'createdAt' },
]

function directionFor(op: ILedger2Operation, walletId: number): 'in' | 'out' | 'move' {
  const from = op.walletFrom ?? null
  const to = op.walletTo ?? null
  if (from === walletId && to && to !== walletId) return 'out'
  if (to === walletId && from && from !== walletId) return 'in'
  if (to === walletId && !from) return 'in'
  if (from === walletId && !to) return 'out'
  return 'move'
}

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
      actionNames: ['walletop'],
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
    wallets.value = await ledger2Store.loadWallets(info.coopname)
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
