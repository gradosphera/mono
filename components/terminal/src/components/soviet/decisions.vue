<template lang="pug">
div.row.justify-center
  div.col-12
    q-card(flat)
      q-table(
        ref="tableRef" v-model:expanded="expanded"
        flat
        bordered
        :rows="decisions"
        :columns="columns"
        :table-colspan="9"
        row-key="table.id"
        :pagination="pagination"
        virtual-scroll
        :virtual-scroll-item-size="48"
        :rows-per-page-options="[10]"
        :loading="onLoading"
        :no-data-label="'У совета нет голосований на повестке'"
      ).full-height.full-width

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
              // q-toggle(v-model="props.expand" checked-icon="fas fa-chevron-circle-left" unchecked-icon="fas fa-chevron-circle-right" )

              q-btn(size="sm" color="primary" dense :icon="props.expand ? 'remove' : 'add'" round @click="props.expand = !props.expand")
            q-td {{ props.row.table.id }}
            q-td
              q-badge {{ getTitle(props.row.table.type, props.row.documents.statement.action.user) }}

            //- q-td
            //-   q-checkbox(@click="updateValidation(props.row.id)" :model-value="props.row.validated")

            q-td
              q-btn(v-if="isVotedFor(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat icon="fa-regular fa-thumbs-down" @click="voteAgainst(props.row.table.id)").text-red

              q-btn(v-if="isVotedAgainst(props.row.table)" disabled dense flat icon="fas fa-thumbs-down").text-red
              q-checkbox( v-model="props.row.table.approved" disable :true-value="1" :false-value="0" )

              q-btn(v-if="isVotedAgainst(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat icon="fa-regular fa-thumbs-up" @click="voteFor(props.row.table.id)").text-green

              q-btn(v-if="isVotedFor(props.row.table)" disabled dense flat icon="fas fa-thumbs-up").text-green

            q-td
              q-checkbox(v-if="!isProcess(props.row.table.id)" :model-value="props.row.table.authorized" :true-value="1" :false-value="0" @click="updateAuthorized(props.row.table.username, props.row.table.id)")
              q-spinner(v-if="isProcess(props.row.table.id)" size="md")

          q-tr(v-show="props.expand" :key="`e_${props.row.table.id}`" :props="props" class="q-virtual-scroll--with-prev")
            q-td(colspan="100%")
              joincoopdoc(v-if="props.row.table.type == 'joincoop'" :documents="props.row.documents")



</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import { Notify } from 'quasar'
import joincoopdoc from './docs/joincoop.vue'
import { sendGET } from 'src/shared/api';
import { useSessionStore } from 'src/entities/Session';
import { Cooperative, SovietContract } from 'cooptypes'
import { useVoteForDecision } from 'src/features/Cooperative/VoteForDecision';
import { useAuthorizeAndExecDecision } from 'src/features/Cooperative/AuthorizeAndExecDecision';
import { useVoteAgainstDecision } from 'src/features/Cooperative/VoteAgainstDecision';
import { COOPNAME } from 'src/shared/config';
const session = useSessionStore()
const onLoading = ref(false)

const columns = [
  { name: 'id', align: 'left', label: '№', field: 'id', sortable: true },
  { name: 'caption', align: 'left', label: 'Повестка', field: 'caption', sortable: true },
  // { name: 'validated', align: 'left', label: 'Проверено', field: 'validated', sortable: true },
  { name: 'approved', align: 'left', label: 'Принято', field: 'approved', sortable: true },
  { name: 'authorized', align: 'left', label: 'Утверждено', field: 'authorized', sortable: true },
] as any

const decisions = ref([] as Cooperative.Documents.IAgenda[])

const loadAgenda = async (hidden?: boolean) => {
  try {
    onLoading.value = hidden == true ? false : true
    decisions.value = (await sendGET('/v1/coop/agenda', {
      coopname: route.params.coopname,
    }) as Cooperative.Documents.IComplexAgenda[])
    onLoading.value = false
  } catch (e: any) {
    onLoading.value = false
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}

loadAgenda()

const interval = setInterval(() => loadAgenda(true), 10000)

onBeforeUnmount(() => clearInterval(interval))

const getTitle = (action: string, user: any) => {
  const actions: any = {
    joincoop: 'Заявление на вступление',
    change: 'Обмен на маркете',
  }
  let title = actions[action]

  if (user.first_name)
    title += ` ${user.last_name} ${user.first_name} ${user.middle_name}`
  else title += ` ${user.short_name}`

  return title
}

// const updateValidation = async (decisionId: number) => {
//   try {
//     await useValidateDecision().validateDecision({
//       coopname: COOPNAME,
//       username: session.username,
//       decision_id: decisionId,
//     })


//     Notify.create({
//       message: 'Решение проверено',
//       type: 'positive',
//     })

//     await loadAgenda()
//   } catch (e) {
//     Notify.create({
//       message: e.message,
//       type: 'negative',
//     })
//   }
// }

const authorizeLoading = ref<any>({})

const isProcess = (decisionId: number) => {
  return authorizeLoading.value[decisionId] ? true : false
}

const updateAuthorized = async (username: string, decision_id: number) => {
  try {

    authorizeLoading.value[decision_id] = true
    const { authorizeAndExecDecision } = useAuthorizeAndExecDecision()

    await authorizeAndExecDecision(username, decision_id)

    Notify.create({
      message: 'Решение принято и исполнено',
      type: 'positive',
    })

    authorizeLoading.value[decision_id] = false
    await loadAgenda()

  } catch (e: any) {
    authorizeLoading.value[decision_id] = false
    console.log('json:', e.json)
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}

const isVotedFor = (decision: SovietContract.Tables.Decisions.IDecision) => {
  return decision.votes_for.includes(session.username)
}

const isVotedAgainst = (decision: SovietContract.Tables.Decisions.IDecision) => {
  return decision.votes_against.includes(session.username)
}

const isVotedAny = (decision: SovietContract.Tables.Decisions.IDecision) => {
  return isVotedAgainst(decision) || isVotedFor(decision)
}

const voteFor = async (decision_id: number) => {
  try {
    const { voteForDecision } = useVoteForDecision()

    const result = await voteForDecision(
      decision_id
    )
    console.log('result: ', result)
    Notify.create({
      message: 'Голос принят',
      type: 'positive',
    })

    await loadAgenda()
  } catch (e: any) {
    console.log(e)
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}

const voteAgainst = async (decision_id: number) => {
  try {
    await useVoteAgainstDecision().voteAgainstDecision({
      coopname: COOPNAME,
      member: session.username,
      decision_id,
    })

    Notify.create({
      message: 'Голос принят',
      type: 'positive',
    })

    await loadAgenda()
  } catch (e: any) {
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}

const expanded = ref([])
const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })
</script>
