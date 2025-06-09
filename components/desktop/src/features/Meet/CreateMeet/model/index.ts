import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import { useSignDocument } from 'src/shared/lib/document/model/entity'
import moment from 'moment-with-locales-es6'

export type ICreateMeetInput = Mutations.Meet.CreateAnnualGeneralMeet.IInput['data']
export type ICreateMeetResult = Mutations.Meet.CreateAnnualGeneralMeet.IOutput[typeof Mutations.Meet.CreateAnnualGeneralMeet.name]

export type IGenerateAgendaInput = Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.IInput['data']
export type IGenerateAgendaResult = Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.IOutput[typeof Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.name]

export interface ICreateMeetWithAgendaInput {
  coopname: string
  initiator: string
  presider: string
  secretary: string
  open_at: string
  close_at: string
  username: string
  agenda_points: {
    title: string
    context: string
    decision: string
  }[]
}

/**
 * Генерирует документ повестки собрания
 * @private Внутренняя функция, не экспортируется
 */
async function generateAgenda(data: IGenerateAgendaInput, options?: any): Promise<IGenerateAgendaResult> {
  const { [Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.name]: generatedDocument } = await client.Mutation(
    Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.mutation,
    {
      variables: {
        data,
        options
      }
    }
  );

  return generatedDocument;
}

export async function createMeet(data: ICreateMeetInput): Promise<ICreateMeetResult> {
  const { [Mutations.Meet.CreateAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.CreateAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

export async function createMeetWithAgenda(data: ICreateMeetWithAgendaInput): Promise<ICreateMeetResult> {

  const { signDocument } = useSignDocument()

  // Преобразуем формат даты для документа
  const openAtFormatted = moment(data.open_at).format('DD.MM.YYYY HH:mm')
  const closeAtFormatted = moment(data.close_at).format('DD.MM.YYYY HH:mm')

  // Формируем вопросы повестки в требуемом формате
  const questions = data.agenda_points.map((point, index) => ({
    number: String(index + 1),
    title: point.title,
    decision: point.decision,
    context: point.context || ''
  }))

  // Генерируем документ повестки с правильными параметрами согласно DTO
  const generatedDocument = await generateAgenda({
    coopname: data.coopname,
    username: data.username,
    meet: {
      type: 'regular', // По умолчанию очередное собрание
      open_at_datetime: openAtFormatted,
      close_at_datetime: closeAtFormatted
    },
    questions: questions
  })


  // Подписываем документ
  const signedDocument = await signDocument(generatedDocument, data.username)

  // Создаем собрание
  const result = await createMeet({
    coopname: data.coopname,
    agenda: data.agenda_points,
    initiator: data.initiator,
    presider: data.presider,
    secretary: data.secretary,
    open_at: data.open_at,
    close_at: data.close_at,
    proposal: signedDocument
  })
  return result
}
