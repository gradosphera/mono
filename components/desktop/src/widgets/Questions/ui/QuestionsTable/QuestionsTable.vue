<template lang="pug">
div.scroll-area(style="height: 90vh; overflow-y: auto;")
  q-table(
    ref="tableRef"
    flat
    :grid="isMobile"
    :rows="decisions"
    :columns="columns"
    :table-colspan="9"
    row-key="table.id"
    :pagination="pagination"
    virtual-scroll
    :virtual-scroll-item-size="48"
    :rows-per-page-options="[10]"
    :loading="loading"
    :no-data-label="'У совета нет вопросов на повестке для голосования. Вопросы на повестку добавляются автоматически при участии пайщиков в цифровых целевых потребительских программах кооператива. Также, вопрос на повестку можно добавить вручную, нажав на кнопку `ПРЕДЛОЖИТЬ ПОВЕСТКУ`.'"
    :virtual-scroll-target="'.scroll-area'"
  ).full-width

    template(#top v-if="$slots.top")
      slot(name="top")

    template(#item="props")
      QuestionCard(
        :agenda="props.row"
        :expanded="expanded.get(props.row.table.id)"
        :is-processing="isProcessing(props.row.table.id)"
        :is-voted-for="isVotedFor"
        :is-voted-against="isVotedAgainst"
        :is-voted-any="isVotedAny"
        @toggle-expand="toggleExpand(props.row.table.id)"
        @authorize="onAuthorizeDecision(props.row)"
        @vote-for="onVoteFor(props.row)"
        @vote-against="onVoteAgainst(props.row)"
      )

    template(#header="props")
      q-tr(:props="props")
        q-th(auto-width)
        q-th(
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
        ) {{ col.label }}

    template(#body="props")
      q-tr(:key="`m_${props.row.table.id}`" :props="props")
        q-td(auto-width)
          q-btn(size="sm" color="primary" dense :icon="expanded.get(props.row.table.id) ? 'remove' : 'add'" round @click="toggleExpand(props.row.table.id)")

        q-td {{ props.row.table.id }}
        q-td {{ props.row.table.username }}
        q-td(style="max-width: 200px; word-wrap: break-word; white-space: normal;") {{ getDecisionTitle(props.row) }}

        q-td {{formatToFromNow(props.row.table.expired_at)}}
        q-td
          VotingButtons(
            :decision="props.row.table"
            :is-voted-for="isVotedFor"
            :is-voted-against="isVotedAgainst"
            :is-voted-any="isVotedAny"
            @vote-for="onVoteFor(props.row)"
            @vote-against="onVoteAgainst(props.row)"
          )
        q-td
          q-btn(
            size="sm"
            color="teal"
            v-if="isChairman"
            :loading="isProcessing(props.row.table.id)"
            @click="onAuthorizeDecision(props.row)"
          ) утвердить

      q-tr(v-if="expanded.get(props.row.table.id)" :key="`e_${props.row.table.id}`" :props="props" class="q-virtual-scroll--with-prev")
        q-td(colspan="100%")
          ComplexDocument(:documents="props.row.documents")
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import { Cooperative } from 'cooptypes'
import { formatToFromNow } from 'src/shared/lib/utils/dates/formatToFromNow'
import { QuestionCard } from '../QuestionCard'
import { VotingButtons } from '../VotingButtons'
import { useWindowSize } from 'src/shared/hooks'

const props = defineProps({
  decisions: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  },
  isChairman: {
    type: Boolean,
    default: false
  },
  formatDecisionTitle: {
    type: Function,
    required: true
  },
  isVotedFor: {
    type: Function,
    required: true
  },
  isVotedAgainst: {
    type: Function,
    required: true
  },
  isVotedAny: {
    type: Function,
    required: true
  },
  processingDecisions: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['authorize', 'vote-for', 'vote-against'])

const { isMobile } = useWindowSize()

// Получение заголовка для решения с поддержкой агрегатов документов
function getDecisionTitle(row: any) {
  // Используем только агрегаты документа
  if (row.documents?.statement?.documentAggregate?.rawDocument?.meta?.title) {
    const title = row.documents.statement.documentAggregate.rawDocument.meta.title
    const user = row.documents.statement.action.user
    return props.formatDecisionTitle(title, user)
  }

  // Запасной вариант
  return 'Вопрос на голосование'
}

// Настройка таблицы
const columns = [
  { name: 'id', align: 'left', label: '№', field: row => row.table.id, sortable: true },
  { name: 'username', align: 'left', label: 'Аккаунт', field: row => row.table.username, sortable: true },
  { name: 'caption', align: 'left', label: 'Пункт', field: row => getDecisionTitle(row), sortable: true },
  { name: 'expired_at', align: 'left', label: 'Истекает', field: row => row.table.expired_at, format: val => formatToFromNow(val), sortable: false },
  { name: 'approved', align: 'left', label: 'Голосование', field: row => row.table.approved, sortable: true },
  { name: 'authorized', align: 'left', label: '', field: row => row.table.authorized, sortable: true },
] as any

// Состояние UI
const expanded = reactive(new Map()) // Map для отслеживания состояния развертывания каждой записи
const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

// UI методы
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id))
}

const isProcessing = (decisionId: number) => {
  // Используем только processingDecisions из props
  return Boolean(props.processingDecisions[decisionId])
}

// Обработчики событий
const onAuthorizeDecision = (row: Cooperative.Document.IComplexAgenda) => {
  emit('authorize', row)
}

const onVoteFor = (row: Cooperative.Document.IComplexAgenda) => {
  emit('vote-for', row)
}

const onVoteAgainst = (row: Cooperative.Document.IComplexAgenda) => {
  emit('vote-against', row)
}
</script>
