import { generateAgenda } from 'src/features/Meet/GenerateAgenda/model'
import { createMeet } from 'src/features/Meet/CreateMeet/model'
import { useSignDocument } from 'src/shared/lib/document/model/entity'
import { hashSHA256 } from 'src/shared/api/crypto'

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

export async function createMeetWithAgenda(data: ICreateMeetWithAgendaInput) {
  const { signDocument } = useSignDocument()
  console.log('on generate', data)
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
  console.log('result: ', result)
  return result
}
