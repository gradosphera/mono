import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IGenerateAgendaInput = Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.IInput['data'];
export type IGenerateAgendaResult = Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.IOutput[typeof Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.name];

export async function generateAgenda(data: IGenerateAgendaInput): Promise<IGenerateAgendaResult> {
  const { [Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.name]: generatedDocument } = await client.Mutation(
    Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.mutation,
    {
      variables: {
        data
      }
    }
  );

  return generatedDocument;
}
