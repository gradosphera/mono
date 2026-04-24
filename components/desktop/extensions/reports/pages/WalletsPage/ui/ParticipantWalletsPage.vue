<template lang="pug">
.participant-wallets.page-shell
  q-inner-loading(:showing='loading')
    q-spinner(size='40px' color='primary')

  .empty-state(v-if='!loading && data.participants.length === 0')
    q-icon(name='fa-solid fa-users-slash' size='32px' color='grey-5')
    .text-caption.q-mt-sm Нет пайщиков (status=accepted)

  q-card.q-mt-md(v-else-if='!loading' flat)
    .table-scroll
      table.pw-table
        thead
          tr
            th.col-user Пайщик
            th.col-prog(v-for='prog in data.programs' :key='prog.id')
              .prog-title {{ prog.title }}
              .prog-type.text-grey-6 {{ prog.program_type }}
            th.col-total Итого
            th.col-action

        tbody
          tr.row-participant(
            v-for='p in data.participants'
            :key='p.username'
          )
            td.col-user
              .username {{ p.username }}
              .type.text-grey-6 {{ typeLabel(p.type) }}

            td.col-prog(
              v-for='prog in data.programs'
              :key='`${p.username}_${prog.id}`'
              :class='cellClass(data.matrix[p.username]?.[prog.id])'
            )
              WalletCell(:cell='data.matrix[p.username]?.[prog.id]')

            td.col-total
              WalletCell(:cell='totalFor(p.username)' bold)

            td.col-action
              q-btn(
                flat dense round size='sm' color='primary'
                icon='fa-solid fa-arrow-right'
                :to='{ name: "reports-operations", query: { username: p.username } }'
              )
                q-tooltip К операциям пайщика

        tfoot
          tr.row-totals
            td.col-user.text-weight-bold Σ по программе
            td.col-prog(
              v-for='prog in data.programs'
              :key='`total_${prog.id}`'
            )
              WalletCell(:cell='data.totals[prog.id]' bold)
            td.col-total
              WalletCell(:cell='grandTotal' bold)
            td.col-action
</template>

<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { FailAlert } from 'src/shared/api'
import { useSystemStore } from 'src/entities/System/model'
import { formatAsset2Digits } from 'src/shared/lib/utils'
import {
  loadParticipantWalletsMatrix,
  type IParticipantWalletsMatrix,
  type IWalletCell,
} from './participant-wallets-api'

const { info } = useSystemStore()

const loading = ref(false)
const data = ref<IParticipantWalletsMatrix>({
  participants: [],
  programs: [],
  matrix: {},
  totals: {},
})

function typeLabel(t: string): string {
  switch (t) {
    case 'individual': return 'Физ. лицо'
    case 'organization': return 'Юр. лицо'
    case 'entrepreneur': return 'ИП'
    default: return t
  }
}

function totalFor(username: string): IWalletCell {
  const row = data.value.matrix[username]
  if (!row) return { available: 0, blocked: 0 }
  let a = 0, b = 0
  for (const c of Object.values(row)) {
    a += c.available
    b += c.blocked
  }
  return { available: a, blocked: b }
}

const grandTotal = computed<IWalletCell>(() => {
  let a = 0, b = 0
  for (const c of Object.values(data.value.totals)) {
    a += c.available
    b += c.blocked
  }
  return { available: a, blocked: b }
})

function cellClass(cell?: IWalletCell): string {
  if (!cell) return 'cell-empty'
  if (cell.available === 0 && cell.blocked === 0) return 'cell-zero'
  return 'cell-has-value'
}

// Inline-рендер ячейки «available / blocked с иконками». Вынесен в h-function
// чтобы не таскать ещё одну SFC (в шаблоне используем как компонент).
const WalletCell = {
  name: 'WalletCell',
  props: {
    cell: { type: Object as () => IWalletCell | undefined, default: undefined },
    bold: { type: Boolean, default: false },
  },
  setup(props: { cell?: IWalletCell; bold?: boolean }) {
    return () => {
      const c = props.cell
      if (!c) {
        return h('div', { class: 'cell-dash' }, '—')
      }
      const aClass = ['cell-line', c.available > 0 ? 'value-avail' : 'value-zero', props.bold ? 'bold' : '']
      const bClass = ['cell-line', c.blocked > 0 ? 'value-blocked' : 'value-zero', props.bold ? 'bold' : '']
      return h('div', { class: 'wallet-cell' }, [
        h('div', { class: aClass.join(' ') }, [
          h('q-icon', {
            name: 'fa-solid fa-coins',
            size: '12px',
            class: 'cell-icon',
          }),
          h('span', { class: 'cell-value' }, formatAsset2Digits(`${c.available.toFixed(4)} RUB`)),
        ]),
        h('div', { class: bClass.join(' ') }, [
          h('q-icon', {
            name: 'fa-solid fa-lock',
            size: '12px',
            class: 'cell-icon',
          }),
          h('span', { class: 'cell-value' }, formatAsset2Digits(`${c.blocked.toFixed(4)} RUB`)),
        ]),
      ])
    }
  },
}

async function reload(): Promise<void> {
  loading.value = true
  try {
    data.value = await loadParticipantWalletsMatrix(info.coopname)
  } catch (e) {
    FailAlert(e, 'Не удалось загрузить кошельки пайщиков')
  } finally {
    loading.value = false
  }
}

defineExpose({ reload })

onMounted(() => void reload())
</script>

<style scoped lang="scss">
.participant-wallets {
  position: relative;
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 48px 16px;
  color: #888;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.pw-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 640px;

  thead {
    background: #fafafa;

    th {
      text-align: left;
      padding: 10px 12px;
      border-bottom: 2px solid #e0e0e0;
      font-weight: 600;
      white-space: nowrap;

      &.col-prog,
      &.col-total {
        text-align: right;
      }

      .prog-title {
        font-size: 13px;
        line-height: 1.2;
      }
      .prog-type {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }
  }

  tbody tr {
    border-bottom: 1px solid #f0f0f0;

    &:hover {
      background: #f7f8fa;
    }
  }

  td {
    padding: 8px 12px;
    vertical-align: middle;

    &.col-prog,
    &.col-total {
      text-align: right;
    }
    &.col-action {
      text-align: right;
      width: 36px;
    }
  }

  .col-user {
    .username {
      font-size: 14px;
      font-weight: 500;
      color: #222;
    }
    .type {
      font-size: 12px;
      margin-top: 2px;
    }
  }

  .cell-empty :deep(.cell-dash) {
    color: #ccc;
    text-align: right;
  }

  .cell-zero :deep(.wallet-cell) {
    opacity: 0.4;
  }

  tfoot {
    background: #f5f6f8;
    border-top: 2px solid #e0e0e0;

    td {
      padding: 10px 12px;
      font-size: 14px;
    }
  }
}

// «available + blocked» — вертикально, с иконками. Стили через :deep
// потому что это render-функция, scoped не пройдёт автоматически.
:deep(.wallet-cell) {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  line-height: 1.3;

  .cell-line {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-variant-numeric: tabular-nums;
    font-size: 14px;
    font-weight: 500;

    &.value-avail {
      color: #2e7d32;
    }
    &.value-blocked {
      color: #8d6e63;
    }
    &.value-zero {
      color: #bbb;
      font-weight: 400;
    }
    &.bold {
      font-weight: 700;
    }
  }

  .cell-icon {
    flex-shrink: 0;
    opacity: 0.75;
  }

  .cell-dash {
    color: #ccc;
  }
}
</style>
