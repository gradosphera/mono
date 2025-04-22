import { Cooperative, SovietContract } from 'cooptypes'
import { useGenerateFreeDecision } from 'src/features/FreeDecision/GenerateDecision'
import { useGenerateParticipantApplicationDecision } from 'src/features/Decision/ParticipantApplication'
import { useGenerateSovietDecisionOnAnnualMeet } from 'src/features/Meet/GenerateSovietDecision/model'
import { useSystemStore } from 'src/entities/System/model'
import { useSessionStore } from 'src/entities/Session'
import { useGlobalStore } from 'src/shared/store'
import { useVoteForDecision } from 'src/features/Decision/VoteForDecision'
import { useVoteAgainstDecision } from 'src/features/Decision/VoteAgainstDecision'
import { sendGET } from 'src/shared/api'
import { ref, Ref } from 'vue'

/**
 * Процесс обработки решений
 * Координирует работу различных фич для генерации и обработки решений различных типов
 */
export function useDecisionProcessor() {
  const { info } = useSystemStore()
  const session = useSessionStore()
  const decisions: Ref<Cooperative.Document.IComplexAgenda[]> = ref([])
  const loading = ref(false)

  /**
   * Форматирует заголовок вопроса
   */
  function formatDecisionTitle(title: string, user: any) {
    let result = 'Вопрос на голосование'

    if (user.first_name) {
      result = `${title} от ${user.last_name} ${user.first_name} ${user.middle_name}`
    } else {
      result = `${title} от ${user.short_name}`
    }

    return result
  }

  /**
   * Загружает список вопросов на повестке
   */
  async function loadDecisions(coopname: string, hidden = false) {
    try {
      loading.value = hidden ? false : true
      decisions.value = await sendGET('/v1/coop/agenda', {
        coopname
      }) as Cooperative.Document.IComplexAgenda[]
      loading.value = false
      return decisions.value
    } catch (error) {
      loading.value = false
      throw error
    }
  }

  /**
   * Генерирует документ решения в зависимости от его типа
   */
  async function generateDecisionDocument(row: Cooperative.Document.IComplexAgenda) {
    const decision_id = Number(row.table.id)
    const username = row.table.username
    const type = row.table.type
    const registry_id = Cooperative.Document.decisionsRegistry[type]

    // Генерация документа в зависимости от типа решения
    let document

    if (registry_id === Cooperative.Registry.FreeDecision.registry_id) {
      const unparsedDocumentMeta = row.table.statement.meta == '' ? '{}' : row.table.statement.meta
      const parsedDocumentMeta = JSON.parse(unparsedDocumentMeta) as Cooperative.Registry.FreeDecision.Action
      const project_id = parsedDocumentMeta.project_id

      const { generateFreeDecision } = useGenerateFreeDecision()
      document = await generateFreeDecision({
        username: username,
        decision_id: decision_id,
        project_id: project_id
      })
    }
    else if (registry_id === Cooperative.Registry.DecisionOfParticipantApplication.registry_id) {
      const { generateParticipantApplicationDecision } = useGenerateParticipantApplicationDecision()
      document = await generateParticipantApplicationDecision({
        username: username,
        decision_id: decision_id
      })
    }
    else if (registry_id === Cooperative.Registry.AnnualGeneralMeetingSovietDecision.registry_id) {
      const { generateSovietDecisionOnAnnualMeet } = useGenerateSovietDecisionOnAnnualMeet()
      document = await generateSovietDecisionOnAnnualMeet({
        username: username,
        meet_hash: row.table.hash
      })
    }
    else {
      throw new Error('Неизвестный тип решения')
    }

    if (!document) {
      throw new Error('Ошибка при генерации документа решения')
    }

    return document
  }

  /**
   * Авторизует и выполняет решение
   */
  async function authorizeAndExecuteDecision(row: Cooperative.Document.IComplexAgenda) {
    const decision_id = Number(row.table.id)

    // Генерируем документ решения
    const document = await generateDecisionDocument(row)

    // Подписываем документ
    const signed_hash_of_document = useGlobalStore().signDigest(document.hash)
    const chainDocument: Cooperative.Document.IChainDocument = {
      hash: document.hash,
      meta: JSON.stringify(document.meta),
      signature: signed_hash_of_document.signature,
      public_key: signed_hash_of_document.public_key,
    }

    // Подготавливаем данные для транзакций
    const authorizeData: SovietContract.Actions.Decisions.Authorize.IAuthorize = {
      coopname: info.coopname,
      chairman: session.username,
      decision_id,
      document: chainDocument,
    }

    const execData: SovietContract.Actions.Decisions.Exec.IExec = {
      executer: session.username,
      coopname: info.coopname,
      decision_id: decision_id,
    }

    // Выполняем транзакции
    await useGlobalStore().transact([
      {
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Decisions.Authorize.actionName,
        authorization: [
          {
            actor: session.username,
            permission: 'active',
          },
        ],
        data: authorizeData,
      },
      {
        account: SovietContract.contractName.production,
        name: SovietContract.Actions.Decisions.Exec.actionName,
        authorization: [
          {
            actor: session.username,
            permission: 'active',
          },
        ],
        data: execData,
      },
    ])

    return true
  }

  /**
   * Голосовать "за" решение
   */
  async function voteForDecision(decision_id: number) {
    const { voteForDecision: vote } = useVoteForDecision()
    await vote(decision_id)
    return true
  }

  /**
   * Голосовать "против" решения
   */
  async function voteAgainstDecision(decision_id: number) {
    await useVoteAgainstDecision().voteAgainstDecision({
      coopname: info.coopname,
      member: session.username,
      decision_id,
    })
    return true
  }

  /**
   * Проверяет, проголосовал ли текущий пользователь "за" решение
   */
  function isVotedFor(decision: SovietContract.Tables.Decisions.IDecision) {
    return decision.votes_for.includes(session.username)
  }

  /**
   * Проверяет, проголосовал ли текущий пользователь "против" решения
   */
  function isVotedAgainst(decision: SovietContract.Tables.Decisions.IDecision) {
    return decision.votes_against.includes(session.username)
  }

  /**
   * Проверяет, проголосовал ли текущий пользователь за решение каким-либо образом
   */
  function isVotedAny(decision: SovietContract.Tables.Decisions.IDecision) {
    return isVotedAgainst(decision) || isVotedFor(decision)
  }

  return {
    decisions,
    loading,
    loadDecisions,
    generateDecisionDocument,
    authorizeAndExecuteDecision,
    voteForDecision,
    voteAgainstDecision,
    isVotedFor,
    isVotedAgainst,
    isVotedAny,
    formatDecisionTitle
  }
}
