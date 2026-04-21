<template lang="pug">
div.page-shell
  //- Активные фильтры (чипы) + фильтры по датам
  q-card.q-mt-md(flat)
    q-card-section
      .row.q-gutter-sm.items-center.q-mb-sm(
        v-if='filters.accountId !== null || filters.processHash'
      )
        q-chip(
          v-if='filters.accountId !== null'
          removable
          color='primary'
          text-color='white'
          icon='fa-solid fa-filter'
          @remove='clearAccountFilter'
        ) {{ accountFilterLabel }}
        q-chip(
          v-if='filters.processHash'
          removable
          color='primary'
          text-color='white'
          icon='fa-solid fa-fingerprint'
          @remove='clearProcessHashFilter'
          class='font-monospace'
        ) Операция {{ filters.processHash.slice(0, 8) }}
      .row.q-gutter-sm.items-end
        q-input.col-md-2.col-12(
          v-model='filters.dateFrom'
          label='С даты'
          dense
          outlined
          readonly
          clearable
          mask='####-##-##'
          @clear='reload'
        )
          template(#append)
            q-icon.cursor-pointer(name='event')
              q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                q-date(
                  v-model='filters.dateFrom'
                  mask='YYYY-MM-DD'
                  today-btn
                  @update:model-value='reload'
                )
                  .row.items-center.justify-end
                    q-btn(v-close-popup flat label='Готово' color='primary')
        q-input.col-md-2.col-12(
          v-model='filters.dateTo'
          label='По дату'
          dense
          outlined
          readonly
          clearable
          mask='####-##-##'
          @clear='reload'
        )
          template(#append)
            q-icon.cursor-pointer(name='event')
              q-popup-proxy(cover transition-show='scale' transition-hide='scale')
                q-date(
                  v-model='filters.dateTo'
                  mask='YYYY-MM-DD'
                  today-btn
                  @update:model-value='reload'
                )
                  .row.items-center.justify-end
                    q-btn(v-close-popup flat label='Готово' color='primary')
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
          q-td
            EntityIdBadge(
              v-if='props.row.processHash'
              :rawId='shortHash(props.row.processHash)'
              @click='copyFullHash(props.row.processHash)'
            )
              q-tooltip Клик — копировать полный хэш
            span.text-grey-6(v-else) —
          q-td {{ formatDate(props.row.createdAt) }}
          q-td
            q-chip(
              dense
              square
              :color='processChipBg(props.row.actionCode)'
              :text-color='processChipText(props.row.actionCode)'
            ) {{ actionLabel(props.row.actionCode) }}
          q-td {{ fioCache.get(props.row.username ?? '') || props.row.username || '-' }}

        q-tr.q-virtual-scroll--with-prev(
          no-hover
          v-if='expanded.get(props.row.globalSequence)'
          :key='`exp_${props.row.globalSequence}`'
          :props='props'
        )
          q-td(colspan='100%')
            .q-pa-md
              //- Шапка: цветная полоска + название + action_code + ID + memo
              .op-header.q-mb-md(
                :style='{ borderLeftColor: processAccentColor(props.row.actionCode) }'
              )
                .text-h6.text-weight-medium {{ actionLabel(props.row.actionCode) }}
                .text-caption.text-grey-7.font-monospace.q-mb-sm {{ props.row.actionCode || '—' }}
                .row.items-center.q-gutter-sm.q-mb-xs(v-if='props.row.processHash')
                  .text-caption.text-grey-7 ID процесса:
                  EntityIdBadge(
                    :rawId='props.row.processHash'
                    copy-on-click
                  )
                    q-tooltip Клик — копировать
                .row.items-center.q-gutter-sm(v-if='props.row.memo')
                  q-icon(name='fa-solid fa-note-sticky' color='grey-6' size='xs')
                  .text-caption.text-grey-8 {{ props.row.memo }}

              //- Тело: две таблицы рядом на md+, друг под другом на маленьких
              template(v-if='childLoading.get(props.row.globalSequence)')
                q-spinner(size='sm')
              .row.q-col-gutter-md(v-else)
                //- Таблица 1: Движения по кошелькам
                .col-12.col-md-6
                  q-card(flat bordered)
                    q-card-section.q-pb-none
                      .text-subtitle2 Движения по кошелькам
                    q-card-section.q-pt-sm
                      q-table(
                        v-if='walletRows(props.row.globalSequence).length'
                        flat dense
                        :rows='walletRows(props.row.globalSequence)'
                        :columns='walletColumns'
                        row-key='globalSequence'
                        hide-pagination
                        :pagination='{ rowsPerPage: 0 }'
                      )
                        template(#body-cell-direction='cp')
                          q-td(:props='cp')
                            DirectionCell(:direction='cp.row.direction')
                        template(#body-cell-walletFrom='cp')
                          q-td(:props='cp')
                            WalletIdCell(:wallet-id='cp.row.walletFrom')
                        template(#body-cell-walletTo='cp')
                          q-td(:props='cp')
                            WalletIdCell(:wallet-id='cp.row.walletTo')
                        template(#body-cell-quantity='cp')
                          q-td.text-right(:props='cp') {{ formatAmount(cp.row.quantity) }}
                      .text-caption.text-grey-6(v-else) Движений по кошелькам нет

                //- Таблица 2: Проводки по счетам (Дт → Кт парами)
                .col-12.col-md-6
                  q-card(flat bordered)
                    q-card-section.q-pb-none
                      .text-subtitle2 Проводки по счетам
                    q-card-section.q-pt-sm
                      q-table(
                        v-if='accountRows(props.row.globalSequence).length'
                        flat dense
                        :rows='accountRows(props.row.globalSequence)'
                        :columns='accountColumns'
                        row-key='key'
                        hide-pagination
                        :pagination='{ rowsPerPage: 0 }'
                      )
                        template(#body-cell-debit='cp')
                          q-td.font-monospace(:props='cp') {{ cp.row.debit ?? '—' }}
                        template(#body-cell-credit='cp')
                          q-td.font-monospace(:props='cp') {{ cp.row.credit ?? '—' }}
                        template(#body-cell-quantity='cp')
                          q-td.text-right(:props='cp') {{ formatAmount(cp.row.quantity) }}
                      .text-caption.text-grey-6(v-else) Проводок нет

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
import { useRoute, useRouter } from 'vue-router'
import { useWindowSize } from 'src/shared/hooks'
import { useSystemStore } from 'src/entities/System/model'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton'
import { EntityIdBadge } from 'src/shared/ui'
import { copyToClipboard } from 'quasar'
import {
  useLedger2Store,
  type ILedger2Operation,
  type ILedger2HistoryFilterInput,
} from 'src/entities/Ledger2'
import { useAccountStore } from 'src/entities/Account'
import { formatAsset2Digits } from 'src/shared/lib/utils'
import { DirectionCell, WalletIdCell } from '../../../shared/ui'

const { info } = useSystemStore()
const { isMobile } = useWindowSize()
const route = useRoute()
const router = useRouter()
const ledger2Store = useLedger2Store()
const accountStore = useAccountStore()

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

// Цветовая схема по префиксу action_code — пастельный chip + accent-полоска
interface ProcessColorEntry {
  accent: string  // CSS hex/color для border-left полоски шапки
  chipBg: string  // Quasar-цвет для q-chip background (pastel)
  chipText: string  // Quasar-цвет для q-chip text-color (deep)
}
const PROCESS_COLORS: Record<string, ProcessColorEntry> = {
  reg:  { accent: '#1976d2', chipBg: 'blue-1',        chipText: 'blue-9' },
  wall: { accent: '#00796b', chipBg: 'teal-1',        chipText: 'teal-9' },
  cap:  { accent: '#5e35b1', chipBg: 'deep-purple-1', chipText: 'deep-purple-9' },
  mkt:  { accent: '#ef6c00', chipBg: 'orange-1',      chipText: 'orange-9' },
  sov:  { accent: '#5d4037', chipBg: 'brown-1',       chipText: 'brown-9' },
  mig:  { accent: '#616161', chipBg: 'grey-3',        chipText: 'grey-9' },
}
const PROCESS_COLOR_DEFAULT: ProcessColorEntry = {
  accent: '#9e9e9e', chipBg: 'grey-3', chipText: 'grey-9',
}
function processColorEntry(code: string | null | undefined): ProcessColorEntry {
  if (!code) return PROCESS_COLOR_DEFAULT
  return PROCESS_COLORS[code.split('.')[0] ?? ''] ?? PROCESS_COLOR_DEFAULT
}
function processAccentColor(code: string | null | undefined): string {
  return processColorEntry(code).accent
}
function processChipBg(code: string | null | undefined): string {
  return processColorEntry(code).chipBg
}
function processChipText(code: string | null | undefined): string {
  return processColorEntry(code).chipText
}

function shortHash(hash: string | null | undefined): string {
  if (!hash) return '—'
  return hash.slice(0, 8)
}

async function copyFullHash(hash: string | null | undefined) {
  if (!hash) return
  try {
    await copyToClipboard(hash)
    SuccessAlert('Скопировано')
  } catch {
    FailAlert('Не удалось скопировать')
  }
}

function formatAmount(qty: string | null | undefined): string {
  if (!qty) return '—'
  return formatAsset2Digits(qty)
}

function displayAccountCode(id: number | null | undefined): string {
  if (id === null || id === undefined) return '—'
  return String(Math.round(id / 1000))
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
  accountKind: 'wallet' | 'account' | null
  accountName: string
  processHash: string | null
}>({
  dateFrom: '',
  dateTo: '',
  accountId: null,
  accountKind: null,
  accountName: '',
  processHash: null,
})

const accountFilterLabel = computed(() => {
  if (filters.accountId === null) return ''
  if (filters.accountKind === 'wallet') {
    return `Кошелёк ${filters.accountId}${filters.accountName ? ` — ${filters.accountName}` : ''}`
  }
  const displayCode = Math.round(filters.accountId / 1000)
  return `Счёт ${displayCode}${filters.accountName ? ` — ${filters.accountName}` : ''}`
})

async function clearAccountFilter() {
  filters.accountId = null
  filters.accountKind = null
  filters.accountName = ''
  const q = { ...route.query }
  delete q.wallet_id
  delete q.account_id
  await router.replace({ query: q })
  reload()
}

async function clearProcessHashFilter() {
  filters.processHash = null
  const q = { ...route.query }
  delete q.process_hash
  await router.replace({ query: q })
  reload()
}

async function resolveAccountName(id: number, kind: 'wallet' | 'account') {
  try {
    if (kind === 'wallet') {
      const wallets = await ledger2Store.loadWallets(info.coopname)
      const w = wallets.find((x) => x.id === id)
      if (w) filters.accountName = w.name
    } else {
      const accounts = await ledger2Store.loadAccounts(info.coopname)
      const a = accounts.find((x) => x.id === id)
      if (a) filters.accountName = a.name
    }
  } catch {
    // молча — chip покажется без названия
  }
}

const columns = [
  { name: 'expand', align: 'left' as const, label: '', field: 'expand', sortable: false },
  { name: 'processHash', align: 'left' as const, label: '№', field: 'processHash' },
  { name: 'createdAt', align: 'left' as const, label: 'Дата', field: 'createdAt' },
  { name: 'actionName', align: 'left' as const, label: 'Операция', field: 'actionCode' },
  { name: 'username', align: 'left' as const, label: 'Исполнитель', field: 'username' },
]

const walletColumns = [
  { name: 'direction', align: 'center' as const, label: '', field: 'direction' },
  { name: 'walletFrom', align: 'left' as const, label: 'Из', field: 'walletFrom' },
  { name: 'walletTo', align: 'left' as const, label: 'В', field: 'walletTo' },
  { name: 'quantity', align: 'right' as const, label: 'Сумма', field: 'quantity' },
]

const accountColumns = [
  { name: 'debit', align: 'center' as const, label: 'Дебет', field: 'debit' },
  { name: 'credit', align: 'center' as const, label: 'Кредит', field: 'credit' },
  { name: 'quantity', align: 'right' as const, label: 'Сумма', field: 'quantity' },
]

// Группированные sibling-операции по parent apply globalSequence
interface WalletRow {
  globalSequence: string
  direction: 'in' | 'out' | 'move'
  walletFrom: number | null
  walletTo: number | null
  quantity: string | null
}
interface AccountRow {
  key: string
  debit: string | null
  credit: string | null
  quantity: string | null
}

function walletRows(parentSeq: string): WalletRow[] {
  const ops = childOps.value.get(parentSeq) ?? []
  return ops
    .filter((o) => o.action === 'walletop')
    .map((o) => {
      const from = o.walletFrom ?? null
      const to = o.walletTo ?? null
      let direction: WalletRow['direction'] = 'move'
      if (from && !to) direction = 'out'
      else if (!from && to) direction = 'in'
      return {
        globalSequence: String(o.globalSequence),
        direction,
        walletFrom: from,
        walletTo: to,
        quantity: o.quantity ?? null,
      }
    })
}

function accountRows(parentSeq: string): AccountRow[] {
  const ops = childOps.value.get(parentSeq) ?? []
  const debit = ops.find((o) => o.action === 'debit')
  const credit = ops.find((o) => o.action === 'credit')
  if (!debit && !credit) return []
  return [
    {
      key: `${parentSeq}_pair`,
      debit: debit?.accountId != null ? displayAccountCode(debit.accountId) : null,
      credit: credit?.accountId != null ? displayAccountCode(credit.accountId) : null,
      quantity: debit?.quantity ?? credit?.quantity ?? null,
    },
  ]
}

const hasAnyFilter = computed(
  () =>
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.accountId !== null ||
    !!filters.processHash,
)

async function resetFilters() {
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.accountId = null
  filters.accountKind = null
  filters.accountName = ''
  filters.processHash = null
  const q = { ...route.query }
  delete q.wallet_id
  delete q.account_id
  delete q.process_hash
  await router.replace({ query: q })
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
    const resp = await ledger2Store.loadHistory({
      coopname: info.coopname,
      processHash,
      parentApplyGlobalSequence: seq,
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
    if (filters.processHash) input.processHash = filters.processHash
    if (filters.dateFrom) input.dateFrom = new Date(filters.dateFrom)
    if (filters.dateTo) {
      const to = new Date(filters.dateTo)
      to.setHours(23, 59, 59, 999)
      input.dateTo = to
    }

    const resp = await ledger2Store.loadHistory(input)
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
        const acc = await accountStore.getAccount(username)
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
      filters.accountKind = 'account'
      resolveAccountName(filters.accountId, 'account')
    } else if (route.query.wallet_id) {
      filters.accountId = Number(route.query.wallet_id)
      filters.accountKind = 'wallet'
      resolveAccountName(filters.accountId, 'wallet')
    }
    if (route.query.process_hash) {
      filters.processHash = String(route.query.process_hash)
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
.op-header {
  border-left: 4px solid #9e9e9e;
  padding: 4px 0 4px 12px;
}
</style>
