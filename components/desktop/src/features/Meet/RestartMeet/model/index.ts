import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import { generateAgenda } from 'src/features/Meet/GenerateAgenda/model'
import { DigitalDocument } from 'src/shared/lib/document'
import { useSessionStore } from 'src/entities/Session';
import type { Cooperative } from 'cooptypes';

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
