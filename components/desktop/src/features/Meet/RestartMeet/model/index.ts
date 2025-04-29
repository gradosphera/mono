import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import { generateAgenda } from 'src/features/Meet/GenerateAgenda/model'
import { useSignDocument } from 'src/shared/lib/document'

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
  const { signDocument } = useSignDocument()
  // Генерируем документ повестки
  const generatedDocument = await generateAgenda({
    coopname: data.coopname,
    username: data.username
  })
  // Подписываем документ
  const signedDocument = await signDocument(generatedDocument)

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
