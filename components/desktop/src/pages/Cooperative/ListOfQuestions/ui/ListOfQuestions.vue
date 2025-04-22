<template lang="pug">
q-card(flat)
  q-table(
    ref="tableRef"
    flat
    grid
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
  ).full-width

    template(#top)
      CreateProjectFreeDecisionButton

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
        q-td
          q-badge {{formatDecisionTitle(props.row.documents.statement.document.meta.title, props.row.documents.statement.action.user)}}

        q-td {{formatToFromNow(props.row.table.expired_at)}}
        q-td
          q-btn(v-if="isVotedFor(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat @click="onVoteAgainst(props.row.table.id)").text-red
            q-icon(name="fa-regular fa-thumbs-down")
            span.q-pl-xs {{props.row.table.votes_against.length}}

          q-btn(v-if="isVotedAgainst(props.row.table)" disabled dense flat).text-red
            q-icon(name="fas fa-thumbs-down")
            span.q-pl-xs {{props.row.table.votes_against.length}}

          q-checkbox( v-model="props.row.table.approved" disable :true-value="1" :false-value="0" )

          q-btn(v-if="isVotedAgainst(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat @click="onVoteFor(props.row.table.id)").text-green
            span.q-pr-xs {{props.row.table.votes_for.length}}
            q-icon(name="fa-regular fa-thumbs-up" style="transform: scaleX(-1)")

          q-btn(v-if="isVotedFor(props.row.table)" disabled dense flat ).text-green
            span.q-pr-xs {{props.row.table.votes_for.length}}
            q-icon(name="fas fa-thumbs-up" style="transform: scaleX(-1)")
        q-td
          q-btn(size="sm" color="teal" v-if="currentUser.isChairman" :loading="isProcessing(props.row.table.id)" @click="onAuthorizeDecision(props.row)") утвердить

      q-tr(v-if="expanded.get(props.row.table.id)" :key="`e_${props.row.table.id}`" :props="props" class="q-virtual-scroll--with-prev")
        q-td(colspan="100%")

          ComplexDocument(:documents="props.row.documents")

</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import { Cooperative } from 'cooptypes'
import { useCurrentUserStore } from 'src/entities/User'
import { CreateProjectFreeDecisionButton } from 'src/features/Decision/CreateProject'
import { formatToFromNow } from 'src/shared/lib/utils/dates/formatToFromNow'
import { useDecisionProcessor } from 'src/processes/process-decisions'
import { FailAlert, SuccessAlert } from 'src/shared/api'

const route = useRoute()
const currentUser = useCurrentUserStore()

// Настройка таблицы
const columns = [
  { name: 'id', align: 'left', label: '№', field: 'id', sortable: true },
  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
  { name: 'caption', align: 'left', label: 'Пункт', field: 'caption', sortable: true },
  { name: 'expired_at', align: 'left', label: 'Истекает', field: 'expired_at', sortable: false },
  { name: 'approved', align: 'left', label: 'Голосование', field: 'approved', sortable: true },
  { name: 'authorized', align: 'left', label: '', field: 'authorized', sortable: true },
] as any

// Состояние UI
const expanded = reactive(new Map()) // Map для отслеживания состояния развертывания каждой записи
const authorizeLoading = ref<Record<number, boolean>>({})
const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })

// Получаем процесс обработки решений
const decisionProcessor = useDecisionProcessor()
const {
  loading,
  loadDecisions,
  authorizeAndExecuteDecision,
  voteForDecision,
  voteAgainstDecision,
  isVotedFor,
  isVotedAgainst,
  isVotedAny,
  formatDecisionTitle
} = decisionProcessor

// Данные
const decisions = computed(() => decisionProcessor.decisions.value)

// UI методы
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id))
}

const isProcessing = (decisionId: number) => {
  return authorizeLoading.value[decisionId] || false
}

// Обработчики событий
const onAuthorizeDecision = async (row: Cooperative.Document.IComplexAgenda) => {
  const decision_id = Number(row.table.id)

  try {
    authorizeLoading.value[decision_id] = true
    await authorizeAndExecuteDecision(row)
    SuccessAlert('Решение принято и исполнено')

    await loadDecisions(route.params.coopname as string)
  } catch (e: any) {
    FailAlert(e)
  } finally {
    authorizeLoading.value[decision_id] = false
  }
}

const onVoteFor = async (decision_id: number) => {
  try {
    await voteForDecision(decision_id)
    SuccessAlert('Голос принят')
    await loadDecisions(route.params.coopname as string)
  } catch (e: any) {
    FailAlert(e)
  }
}

const onVoteAgainst = async (decision_id: number) => {
  try {
    await voteAgainstDecision(decision_id)
    SuccessAlert('Голос принят')
    await loadDecisions(route.params.coopname as string)
  } catch (e: any) {
    FailAlert(e)
  }
}

// Инициализация
loadDecisions(route.params.coopname as string)

// Периодическое обновление данных
const interval = setInterval(() => loadDecisions(route.params.coopname as string, true), 10000)
onBeforeUnmount(() => clearInterval(interval))
</script>
