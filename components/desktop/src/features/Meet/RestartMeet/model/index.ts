import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import { generateAgenda } from 'src/features/Meet/GenerateAgenda/model'
import { DigitalDocument } from 'src/shared/lib/document'
import { useSessionStore } from 'src/entities/Session';
import type { Cooperative } from 'cooptypes';
import { computed, ref, type Ref } from 'vue'
import { useMeetStore } from 'src/entities/Meet'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import moment from 'moment-with-locales-es6'
import { useSystemStore } from 'src/entities/System/model';

moment.locale('ru')

export type IRestartMeetInput = Mutations.Meet.RestartAnnualGeneralMeet.IInput['data'];
export type IRestartMeetResult = Mutations.Meet.RestartAnnualGeneralMeet.IOutput[typeof Mutations.Meet.RestartAnnualGeneralMeet.name];

export interface IRestartMeetWithProposalInput {
  coopname: string
  hash: string
  username: string
  new_open_at: string
  new_close_at: string
  agenda_points: {
    title: string
    context: string
    decision: string
  }[]
}

// Базовые функции для работы с API
export async function restartMeet(data: IRestartMeetInput): Promise<IRestartMeetResult> {
  const { [Mutations.Meet.RestartAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.RestartAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

export async function restartMeetWithProposal(data: IRestartMeetWithProposalInput): Promise<IRestartMeetResult> {
  const { username } = useSessionStore()
  // Генерируем документ повестки
  const generatedDocument = await generateAgenda({
    coopname: data.coopname,
    username: data.username
  })
  // Подписываем документ
  const rawDocument = new DigitalDocument(generatedDocument)
  const signedDocument = await rawDocument.sign<Cooperative.Registry.AnnualGeneralMeetingAgenda.Meta>(username)

  // Перезапускаем собрание
  const result = await restartMeet({
    coopname: data.coopname,
    hash: data.hash,
    new_open_at: data.new_open_at,
    new_close_at: data.new_close_at,
    newproposal: signedDocument
  })
  return result
}

// Композабл для использования в компонентах
export const useRestartMeet = (
  isProcessing?: Ref<boolean>
) => {
  const localIsProcessing = ref(false)
  const { info } = useSystemStore()

  const processingRef = isProcessing || localIsProcessing

  const meetStore = useMeetStore()
  const sessionStore = useSessionStore()

  const canRestartMeet = computed(() => {
    const meet = meetStore.currentMeet
    if (!meet?.processing?.meet) return false

    const now = moment()
    const closeAt = moment(meet.processing.meet.close_at)

    const isAfterCloseDate = now.isAfter(closeAt)
    const isQuorumNotPassed = meet.processing.meet.quorum_passed !== true

    return isAfterCloseDate && isQuorumNotPassed && meet.processing.meet.status === 'authorized'
  })

  const handleRestartMeet = async (data: {
    new_open_at: string;
    new_close_at: string;
    agenda_points: {
      title: string;
      context: string;
      decision: string;
    }[];
  }) => {
    if (!meetStore.currentMeet) return false
    processingRef.value = true
    try {
      await restartMeetWithProposal({
        coopname: info.coopname,
        hash: meetStore.currentMeet.hash,
        username: sessionStore.username,
        new_open_at: data.new_open_at,
        new_close_at: data.new_close_at,
        agenda_points: data.agenda_points
      })

      await meetStore.loadMeet({ coopname: info.coopname, hash: meetStore.currentMeet.hash })
      SuccessAlert('Собрание успешно перезапущено')
      return true
    } catch (error: any) {
      FailAlert(error)
      return false
    } finally {
      processingRef.value = false
    }
  }

  return {
    canRestartMeet,
    handleRestartMeet
  }
}
