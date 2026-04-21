<template lang="pug">
div.page-shell
  q-card.hero-card(flat)
    .hero-title Операции

  //- Фильтр по датам
  q-card.q-mt-md(flat)
    q-card-section
      .row.q-gutter-sm.items-end
        q-input.col-md-2.col-12(
          v-model='filters.dateFrom'
          type='date'
          label='С даты'
          dense
          outlined
          clearable
          @update:model-value='reload'
        )
        q-input.col-md-2.col-12(
          v-model='filters.dateTo'
          type='date'
          label='По дату'
          dense
          outlined
          clearable
          @update:model-value='reload'
        )
        q-btn.col-md-auto(
          v-if='hasAnyFilter'
          flat
          icon='fa-solid fa-rotate'
          label='Сбросить'
          @click='resetFilters'
        )

  //- Таблица операций (только apply)
  q-card.q-mt-md(flat)
    q-table.full-height(
      flat
      :grid='isMobile'
      :rows='items'
      :columns='columns'
      row-key='globalSequence'
      :loading='loading'
      :pagination='pagination'
      :rows-per-page-options='[25, 50, 100, 200]'
      :no-data-label='"Операции не найдены"'
      @request='onRequest'
    )
      template(#body='props')
        q-tr(
          :key='`op_${props.row.globalSequence}`'
          :ref='(el) => registerRowRef(props.row.globalSequence, el)'
          :props='props'
        )
          q-td(auto-width)
            ExpandToggleButton(
              :expanded='expanded.get(props.row.globalSequence)'
              @click='toggleExpand(props.row.globalSequence, props.row.processHash)'
            )
          q-td {{ formatDate(props.row.createdAt) }}
          q-td.font-monospace {{ props.row.actionCode || '-' }}
          q-td {{ actionLabel(props.row.actionCode) }}
          q-td {{ fioCache.get(props.row.username ?? '') || props.row.username || '-' }}

        q-tr.q-virtual-scroll--with-prev(
          no-hover
          v-if='expanded.get(props.row.globalSequence)'
          :key='`exp_${props.row.globalSequence}`'
          :props='props'
        )
          q-td(colspan='100%')
            .q-pa-md
              .row.q-gutter-md
                .col-md-5.col-12
                  .text-subtitle2.q-mb-xs Операция
                  .text-body2 {{ actionLabel(props.row.actionCode) }} ({{ props.row.actionCode || '-' }})
                  .text-body2 Хэш процесса: {{ props.row.processHash || '-' }}
                  .text-body2(v-if='props.row.memo') Примечание: {{ props.row.memo }}
                .col-md-7.col-12
                  .text-subtitle2.q-mb-xs Проводки и движения
                  template(v-if='childLoading.get(props.row.globalSequence)')
                    q-spinner(size='sm')
                  template(v-else-if='childOps.get(props.row.globalSequence)?.length')
                    q-table(
                      flat dense
                      :rows='childOps.get(props.row.globalSequence) ?? []'
                      :columns='childColumns'
                      row-key='globalSequence'
                      hide-pagination
                      :pagination='{ rowsPerPage: 0 }'
                    )
                      template(#body-cell-action='cp')
                        q-td(:props='cp')
                          q-badge(
                            outline
                            :color='getActionColor(cp.row.action)'
                            size='sm'
                          ) {{ actionTypeName(cp.row.action) }}
                      template(#body-cell-accountId='cp')
                        q-td(:props='cp') {{ cp.row.accountId ?? '-' }}
                      template(#body-cell-quantity='cp')
                        q-td(:props='cp') {{ cp.row.quantity || '-' }}
                  .text-caption.text-grey-6(v-else) Проводки не найдены

      template(#item='props')
        .col-12
          q-card.q-pa-md.q-mb-sm
            .row.items-center.q-gutter-x-md
              .col
                .text-caption.text-grey-6 {{ formatDate(props.row.createdAt) }}
                .text-body2.text-weight-medium {{ actionLabel(props.row.actionCode) }}
                .text-caption.text-grey-6.font-monospace {{ props.row.actionCode || '-' }}
              .col-12.text-caption.text-grey-7
                | Исполнитель: {{ fioCache.get(props.row.username ?? '') || props.row.username || '-' }}
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useWindowSize } from 'src/shared/hooks'
import { useSystemStore } from 'src/entities/System/model'
import { FailAlert } from 'src/shared/api'
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton'
import {
  ledger2Api,
  type ILedger2Operation,
  type ILedger2HistoryFilterInput,
} from 'src/entities/Ledger2'
import { api as accountApi } from 'src/entities/Account/api'

const { info } = useSystemStore()
const { isMobile } = useWindowSize()
const route = useRoute()

// Реестр русских названий ACTION_REGISTRY кодов
const ACTION_LABELS: Record<string, string> = {
  'reg.entrfee':  'Вступительный взнос',
  'reg.minshare': 'Минимальный паевой взнос',
  'wall.depcpl':  'Пополнение паевого счёта',
  'wall.wthcpl':  'Возврат паевого взноса',
  'cap.import':   'Импорт пайщика',
  'cap.invest':   'Инвестиция',
  'cap.commit':   'Коммит РИД',
  'cap.accept':   'Приём РИД в паевой фонд',
  'cap.act2prp':  'Имущественный паевой взнос',
  'cap.lnissue':  'Выдача займа',
  'cap.lnrepay':  'Возврат займа',
  'sov.axncnv':   'Конвертация в членский взнос',
  'mkt.supplcnf': 'Подтверждение поставки',
  'mkt.recvcnf':  'Подтверждение получения',
  'mig.minshr':   'Миграция: минимальный паевой взнос',
  'mig.share':    'Миграция: паевые взносы',
  'mig.entry':    'Миграция: вступительные взносы',
  'mig.rid':      'Миграция: РИД в НМА',
}

function actionLabel(code: string | null | undefined): string {
  if (!code) return '—'
  return ACTION_LABELS[code] ?? code
}

function actionTypeName(action: string): string {
  return ({ apply: 'Применить', walletop: 'Движение', debit: 'Дебет', credit: 'Кредит' }[action] ?? action)
}

function getActionColor(a: string): string {
  return ({ apply: 'deep-purple', walletop: 'teal', debit: 'green', credit: 'red' }[a] || 'grey')
}

const loading = ref(false)
const items = ref<ILedger2Operation[]>([])
const expanded = ref(new Map<string, boolean>())
const rowRefs = new Map<string, HTMLElement | null>()

// FIO-кэш: username → ФИО
const fioCache = ref(new Map<string, string>())

// Дочерние операции для развёрнутого apply
const childOps = ref(new Map<string, ILedger2Operation[]>())
const childLoading = ref(new Map<string, boolean>())

function registerRowRef(seq: string, el: unknown): void {
  if (el && typeof (el as { $el?: HTMLElement }).$el !== 'undefined') {
    rowRefs.set(String(seq), (el as { $el: HTMLElement }).$el)
  } else if (el instanceof HTMLElement) {
    rowRefs.set(String(seq), el)
  } else if (el === null) {
    rowRefs.delete(String(seq))
  }
}

const pagination = ref({ page: 1, rowsPerPage: 50, rowsNumber: 0 })

const filters = reactive<{
  dateFrom: string
  dateTo: string
  accountId: number | null
}>({
  dateFrom: '',
  dateTo: '',
  accountId: null,
})

const columns = [
  { name: 'expand', align: 'left' as const, label: '', field: 'expand', sortable: false },
  { name: 'createdAt', align: 'left' as const, label: 'Дата', field: 'createdAt' },
  { name: 'actionCode', align: 'left' as const, label: 'Код', field: 'actionCode' },
  { name: 'actionName', align: 'left' as const, label: 'Операция', field: 'actionCode' },
  { name: 'username', align: 'left' as const, label: 'Исполнитель', field: 'username' },
]

const childColumns = [
  { name: 'action', align: 'left' as const, label: 'Тип', field: 'action' },
  { name: 'accountId', align: 'left' as const, label: 'Счёт/кошелёк', field: 'accountId' },
  { name: 'quantity', align: 'right' as const, label: 'Сумма', field: 'quantity' },
]

const hasAnyFilter = computed(() => !!filters.dateFrom || !!filters.dateTo)

function resetFilters() {
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.accountId = null
  reload()
}

function toggleExpand(seq: string, processHash: string | null | undefined) {
  const wasOpen = expanded.value.get(seq)
  expanded.value.set(seq, !wasOpen)
  if (!wasOpen && processHash && !childOps.value.has(seq)) {
    loadChildOps(seq, processHash)
  }
}

async function loadChildOps(seq: string, processHash: string) {
  childLoading.value.set(seq, true)
  try {
    const resp = await ledger2Api.getHistory({
      coopname: info.coopname,
      processHash,
      actionNames: ['walletop', 'debit', 'credit'],
      limit: 10,
      sortOrder: 'ASC',
    })
    childOps.value.set(seq, resp?.items ?? [])
  } catch (e) {
    FailAlert(e)
  } finally {
    childLoading.value.set(seq, false)
  }
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

let lastRequestId = 0

async function reload() {
  pagination.value.page = 1
  await load()
}

async function load() {
  const myId = ++lastRequestId
  loading.value = true
  try {
    const input: ILedger2HistoryFilterInput = {
      coopname: info.coopname,
      actionNames: ['apply'],
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      sortOrder: 'DESC',
    }
    if (filters.accountId !== null) input.accountId = filters.accountId
    if (filters.dateFrom) input.dateFrom = new Date(filters.dateFrom)
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      input.dateTo = to
    }

    const resp = await ledger2Api.getHistory(input)
    if (myId !== lastRequestId) return
    if (resp) {
      items.value = resp.items
      pagination.value.rowsNumber = resp.totalCount
      enrichFio(resp.items)
    }
  } catch (e) {
    if (myId === lastRequestId) FailAlert(e)
  } finally {
    if (myId === lastRequestId) loading.value = false
  }
}

function onRequest(props: { pagination: { page: number; rowsPerPage: number; rowsNumber?: number } }) {
  pagination.value = {
    page: props.pagination.page,
    rowsPerPage: props.pagination.rowsPerPage,
    rowsNumber: props.pagination.rowsNumber ?? pagination.value.rowsNumber,
  }
  load()
}

async function enrichFio(ops: ILedger2Operation[]) {
  const usernames = [...new Set(ops.map((o) => o.username).filter((u): u is string => !!u && !fioCache.value.has(u)))]
  if (!usernames.length) return
  await Promise.allSettled(
    usernames.map(async (username) => {
      try {
        const acc = await accountApi.getAccount(username)
        const pd = acc?.private_account
        if (!pd) return
        let fio = ''
        if (pd.type === 'individual' && pd.individual_data) {
          const d = pd.individual_data
          fio = [d.last_name, d.first_name, d.middle_name].filter(Boolean).join(' ')
        } else if (pd.type === 'organization' && pd.organization_data) {
          fio = (pd.organization_data as any).short_name ?? username
        } else if (pd.type === 'entrepreneur' && pd.entrepreneur_data) {
          const d = pd.entrepreneur_data as any
          fio = [d.last_name, d.first_name, d.middle_name].filter(Boolean).join(' ')
        }
        if (fio) fioCache.value.set(username, fio)
      } catch {
        // молча — username остаётся как fallback
      }
    }),
  )
}

onMounted(async () => {
  try {
    if (route.query.account_id) {
      filters.accountId = Number(route.query.account_id)
    } else if (route.query.wallet_id) {
      filters.accountId = Number(route.query.wallet_id)
    }
    await load()

    if (route.query.operation_id) {
      const seq = String(route.query.operation_id)
      expanded.value.set(seq, true)
      nextTick(() => {
        rowRefs.get(seq)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  } catch (e) {
    FailAlert(e)
  }
})
</script>

<style scoped>
.font-monospace {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.03em;
}
</style>
