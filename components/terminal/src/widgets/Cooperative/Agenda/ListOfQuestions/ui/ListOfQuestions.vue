<template lang="pug">
q-card(flat)
  q-table(
    ref="tableRef"
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
  ).full-width

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
          q-badge {{ getTitle(props.row.table.type, props.row.documents.statement.action.user) }}

        //- q-td
        //-   q-checkbox(@click="updateValidation(props.row.id)" :model-value="props.row.validated")

        q-td
          //- p Проголосовало {{  props.row.table.votes_for.length + props.row.table.votes_against.length}} из {{totalMembers}}


          q-btn(v-if="isVotedFor(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat @click="voteAgainst(props.row.table.id)").text-red
            q-icon(name="fa-regular fa-thumbs-down")
            span.q-pl-xs {{props.row.table.votes_against.length}}

          q-btn(v-if="isVotedAgainst(props.row.table)" disabled dense flat).text-red
            q-icon(name="fas fa-thumbs-down")
            span.q-pl-xs {{props.row.table.votes_against.length}}

          q-checkbox( v-model="props.row.table.approved" disable :true-value="1" :false-value="0" )

          q-btn(v-if="isVotedAgainst(props.row.table) || !isVotedAny(props.row.table)" :disabled="isVotedAny(props.row.table)" dense flat @click="voteFor(props.row.table.id)").text-green
            span.q-pr-xs {{props.row.table.votes_for.length}}
            q-icon(name="fa-regular fa-thumbs-up" style="transform: scaleX(-1)")

          q-btn(v-if="isVotedFor(props.row.table)" disabled dense flat ).text-green
            span.q-pr-xs {{props.row.table.votes_for.length}}
            q-icon(name="fas fa-thumbs-up" style="transform: scaleX(-1)")

        q-td
          q-btn(size="sm" color="teal" v-if="currentUser.isChairman" :loading="isProcess(props.row.table.id)" @click="updateAuthorized(props.row.table.username, props.row.table.id)") утвердить

      q-tr(v-if="expanded.get(props.row.table.id)" :key="`e_${props.row.table.id}`" :props="props" class="q-virtual-scroll--with-prev")
        q-td(colspan="100%")
          RegistratorJoincoopDocument(v-if="props.row.table.type == 'joincoop'" :documents="props.row.documents")



</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import { Notify } from 'quasar'
import { RegistratorJoincoopDocument } from 'src/entities/Document/ui/Templates/RegistratorJoincoop';
import { sendGET } from 'src/shared/api';
import { useSessionStore } from 'src/entities/Session';
import { Cooperative, SovietContract } from 'cooptypes'
import { useVoteForDecision } from 'src/features/Cooperative/VoteForDecision';
import { useAuthorizeAndExecDecision } from 'src/features/Cooperative/AuthorizeAndExecDecision';
import { useVoteAgainstDecision } from 'src/features/Cooperative/VoteAgainstDecision';
import { COOPNAME } from 'src/shared/config';
import { useCooperativeStore } from 'src/entities/Cooperative/model/stores';
import { useCurrentUserStore } from 'src/entities/User';
const session = useSessionStore()
const onLoading = ref(false)
const currentUser = useCurrentUserStore()

const columns = [
  { name: 'id', align: 'left', label: '№', field: 'id', sortable: true },
  { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },

  { name: 'caption', align: 'left', label: 'Пункт', field: 'caption', sortable: true },
  // { name: 'validated', align: 'left', label: 'Проверено', field: 'validated', sortable: true },
  { name: 'approved', align: 'left', label: 'Голосование', field: 'approved', sortable: true },
  { name: 'authorized', align: 'left', label: '', field: 'authorized', sortable: true },
] as any

const coop = useCooperativeStore()
coop.loadPrivateCooperativeData()

const expanded = reactive(new Map()) // Используем Map для отслеживания состояния развертывания каждой записи

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id))
}

// const totalMembers = computed(() => coop.privateCooperativeData?.totalMembers)

const decisions = ref([] as Cooperative.Document.IAgenda[])

const loadAgenda = async (hidden?: boolean) => {
  try {
    onLoading.value = hidden == true ? false : true
    decisions.value = (await sendGET('/v1/coop/agenda', {
      coopname: route.params.coopname,
    }) as Cooperative.Document.IComplexAgenda[])
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

const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })
</script>
