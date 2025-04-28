import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import { generateAgenda } from 'src/features/Meet/GenerateAgenda/model'
import { useSignDocument } from 'src/shared/lib/document/model/entity'
import { hashSHA256 } from 'src/shared/api/crypto'

export type ICreateMeetInput = Mutations.Meet.CreateAnnualGeneralMeet.IInput['data']
export type ICreateMeetResult = Mutations.Meet.CreateAnnualGeneralMeet.IOutput[typeof Mutations.Meet.CreateAnnualGeneralMeet.name]

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
  // Генерируем документ повестки
  const generatedDocument = await generateAgenda({
    coopname: data.coopname,
    username: data.username
  })
  // Подписываем документ
  const signedDocument = await signDocument(generatedDocument)

  // Создаем собрание
  const result = await createMeet({
    coopname: data.coopname,
    agenda: data.agenda_points,
    initiator: data.initiator,
    presider: data.presider,
    secretary: data.secretary,
    open_at: data.open_at,
    close_at: data.close_at,
    hash: await hashSHA256(JSON.stringify({
      coopname: data.coopname,
      initiator: data.initiator,
      timestamp: Date.now()
    })),
    proposal: signedDocument
  })
  return result
}
