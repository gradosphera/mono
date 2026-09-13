<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { BaseButton, BaseDialog, BaseSelect, BaseTable, EmptyState } from 'src/shared/ui/base'
import type { BaseTableColumn } from 'src/shared/ui/base'
import { AmountInput, PageHint } from 'src/shared/ui/domain'
import { marketplaceOrderUnitLabel } from 'src/shared/lib/consts/marketplace-units'
import { listInventory, type MarketplaceInventoryItemView } from 'src/entities/MarketplaceInventory'
import { getEconomyConfig, setMembershipFee } from '../api'

/**
 * Стол администратора → «Экономика» (requirement b6): единая ставка
 * членского взноса кооператива. Одна ставка на все кооперативные участки —
 * против спекуляций и конкуренции между ними; задаётся транзакцией и
 * применяется к заказам, созданным после установки.
 *
 * Паттерн «настройка-значение» как в банковских приложениях: значение
 * показывается статичным крупным числом (не полем-инпутом), правка — в
 * отдельном сфокусированном диалоге. Так экран не «прыгает» при переходе
 * просмотр↔правка и не притворяется формой там, где меняют одну цифру.
 */

const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const currentPercent = ref(0)
const draftPercent = ref<number>(0)

const displayValue = computed(() => currentPercent.value.toFixed(2).replace('.', ','))
const changed = computed(() => Number(draftPercent.value) !== currentPercent.value)

async function load(): Promise<void> {
  loading.value = true
  try {
    const config = await getEconomyConfig()
    currentPercent.value = config.membership_fee_percent
  } catch (e) {
    FailAlert(e, 'Не удалось загрузить наценку')
  } finally {
    loading.value = false
  }
}

function openDialog(): void {
  draftPercent.value = currentPercent.value
  dialogOpen.value = true
}

async function onSave(): Promise<void> {
  saving.value = true
  try {
    const config = await setMembershipFee({ membership_fee_percent: Number(draftPercent.value) })
    currentPercent.value = config.membership_fee_percent
    dialogOpen.value = false
    SuccessAlert('Наценка установлена')
  } catch (e) {
    FailAlert(e, 'Не удалось установить ставку')
  } finally {
    saving.value = false
  }
}

// ─── Топ позиций по обороту ───
// Оборот считается по приёмке на склад: это единственное событие склада с
// собственной датой, и именно оно отвечает на вопрос «сколько имущества
// прошло через кооператив за период». Раньше рейтинг висел на складе без
// периода вовсе — «15 единиц» ни о чём не говорили.

const TURNOVER_PERIODS = [
  { label: 'За 7 дней', value: 7 },
  { label: 'За 30 дней', value: 30 },
  { label: 'За 90 дней', value: 90 },
  { label: 'За всё время', value: 0 },
]

const TOP_LIMIT = 10

const periodDays = ref<number>(30)
const inventory = ref<MarketplaceInventoryItemView[]>([])
const turnoverLoading = ref(true)

async function loadTurnover(): Promise<void> {
  turnoverLoading.value = true
  try {
    inventory.value = await listInventory()
  } catch (e) {
    FailAlert(e, 'Не удалось загрузить оборот склада')
  } finally {
    turnoverLoading.value = false
  }
}

const periodLabel = computed(
  () => TURNOVER_PERIODS.find((p) => p.value === periodDays.value)?.label.toLowerCase() ?? '',
)

/** Дата приёмки в миллисекундах; пусто и мусор — null. */
function receivedAt(row: MarketplaceInventoryItemView): number | null {
  const raw = row.received_at ?? row.created_at
  if (raw === null || raw === undefined) return null
  const t = new Date(String(raw)).getTime()
  return Number.isFinite(t) ? t : null
}

interface TurnoverRow {
  key: string
  rank: number
  title: string
  pvz: string
  pvzAddress: string | null
  quantity: number
  unit: string
}

const turnoverRows = computed<TurnoverRow[]>(() => {
  const since = periodDays.value > 0 ? Date.now() - periodDays.value * 86_400_000 : null
  const map = new Map<string, { title: string; pvz: string; pvzAddress: string | null; unit: string; quantity: number }>()
  for (const row of inventory.value) {
    if (since !== null) {
      const at = receivedAt(row)
      if (at === null || at < since) continue
    }
    const key = `${row.braname}::${row.offer_id ?? row.product_name_snapshot}`
    const bucket = map.get(key) ?? {
      title: row.product_name_snapshot,
      pvz: row.delivery_point_name?.trim() || row.braname,
      pvzAddress: row.delivery_point_address ?? null,
      unit: marketplaceOrderUnitLabel(row.unit_of_measure),
      quantity: 0,
    }
    bucket.quantity += row.quantity_per_label
    map.set(key, bucket)
  }
  return [...map.entries()]
    .map(([key, b]) => ({ key, ...b }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, TOP_LIMIT)
    .map((b, i) => ({ ...b, rank: i + 1 }))
})

const turnoverColumns: BaseTableColumn<TurnoverRow>[] = [
  { key: 'rank', label: '№', width: '56px', numeric: true },
  { key: 'title', label: 'Позиция', width: '280px' },
  { key: 'pvz', label: 'Пункт выдачи', width: '280px' },
  { key: 'quantity', label: 'Принято, ед.', width: '140px', numeric: true },
]

onMounted(() => {
  void load()
  void loadTurnover()
})
</script>

<template lang="pug">
q-page.admin-economy
  PageHint(storage-key='mp:admin-economy:banner-dismissed')
    | Наценка добавляется к стоимости каждого заказа Стола заказов и
    | после исполнения заказа распределяется кооперативному участку выдачи.
    | Наценка идёт на обеспечение хозяйственной деятельности кооператива и
    | едина для всех участков и категорий — так исключаются
    | спекуляции и переток заказов между участками. Изменение действует на
    | заказы, созданные после установки.

  .admin-economy__card
    .admin-economy__stat
      .admin-economy__label Наценка
      .admin-economy__value
        span.admin-economy__amount {{ displayValue }}
        span.admin-economy__unit %
      .admin-economy__caption на обеспечение хозяйственной деятельности
    BaseButton.admin-economy__edit(
      variant='secondary',
      size='sm',
      :disabled='loading',
      @click='openDialog'
    )
      template(#icon-left)
        q-icon(name='edit', size='16px')
      | Изменить

  section.admin-economy__section
    .admin-economy__section-head
      .t-h3 Топ позиций по обороту
      BaseSelect.admin-economy__period(
        v-model='periodDays',
        :options='TURNOVER_PERIODS',
        label='Период'
      )
    .admin-economy__section-note
      | Оборот — имущество, принятое на склады пунктов выдачи {{ periodLabel }}.
      | Считается по дате приёмки кооперативом.

    BaseTable(
      v-if='turnoverLoading || turnoverRows.length',
      :columns='turnoverColumns',
      :rows='turnoverRows',
      row-key='key',
      :loading='turnoverLoading',
      min-width='760px'
    )
      template(#cell-pvz='{ row }')
        .admin-economy__pvz
          span.admin-economy__pvz-name {{ row.pvz }}
          span.admin-economy__pvz-addr(v-if='row.pvzAddress') {{ row.pvzAddress }}
      template(#cell-quantity='{ row }')
        strong {{ row.quantity }} {{ row.unit }}

    EmptyState(
      v-else,
      title='Оборота за период нет',
      body='Здесь появится рейтинг позиций по объёму, прошедшему через пункты выдачи. Выберите период подлиннее, если приёмок давно не было.'
    )
      template(#icon)
        q-icon(name='leaderboard', size='48px')

  BaseDialog(v-model='dialogOpen', title='Наценка', size='sm')
    p.admin-economy__dialog-hint
      | Наценка идёт на обеспечение хозяйственной деятельности кооператива.
      | Новое значение применится к заказам, созданным после сохранения. Уже
      | оформленные заказы не пересчитываются.
    AmountInput(
      v-model='draftPercent',
      label='Наценка',
      symbol='%',
      :precision='2',
      :min='0',
      :max='100',
      :disabled='saving'
    )
    template(#footer)
      BaseButton(variant='ghost', :disabled='saving', @click='dialogOpen = false') Отмена
      BaseButton(
        variant='primary',
        :loading='saving',
        :disabled='!changed',
        @click='onSave'
      ) Сохранить
</template>

<style scoped lang="scss">
.admin-economy {
  padding: var(--p-6, 24px);
  display: flex;
  flex-direction: column;
  gap: var(--p-4, 16px);

  &__card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--p-4, 16px);
    border: 1px solid var(--p-line);
    border-radius: var(--p-r-md, 12px);
    background: var(--p-surface);
    padding: var(--p-5, 20px) var(--p-6, 24px);
    max-width: 480px;
  }

  &__label {
    color: var(--p-ink-2);
    font-size: var(--p-fs-body-sm, 13px);
    margin-bottom: var(--p-1, 4px);
  }

  &__caption {
    margin-top: var(--p-1, 4px);
    color: var(--p-ink-3);
    font-size: var(--p-fs-body-sm, 13px);
    line-height: var(--p-lh-body-sm, 1.5);
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: var(--p-1, 4px);
    color: var(--p-ink);
  }

  &__amount {
    font-size: var(--p-fs-h1, 24px);
    line-height: var(--p-lh-h1, 1.2);
    letter-spacing: var(--p-ls-h1, -0.018em);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' 1;
  }

  &__unit {
    font-size: var(--p-fs-h3, 15px);
    font-weight: 500;
    color: var(--p-ink-2);
  }

  &__edit {
    flex-shrink: 0;
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: var(--p-3, 12px);
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--p-3, 12px);
  }

  &__period {
    width: 200px;
  }

  &__section-note {
    color: var(--p-ink-3);
    font-size: var(--p-fs-body-sm, 13px);
    line-height: var(--p-lh-body-sm, 1.5);
  }

  &__pvz {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__pvz-name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  &__pvz-addr {
    color: var(--p-ink-3);
    font-size: var(--p-fs-body-sm, 13px);
    overflow-wrap: anywhere;
  }

  &__dialog-hint {
    margin: 0;
    color: var(--p-ink-2);
    font-size: var(--p-fs-body-sm, 13px);
    line-height: var(--p-lh-body-sm, 1.5);
  }
}

@media (max-width: 599px) {
  .admin-economy {
    padding: var(--p-4, 16px);

    &__card {
      max-width: none;
    }
  }
}
</style>
