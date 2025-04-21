import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IGenerateAgendaInput = Mutations.Meet.GenerateAnnualGeneralMeetAgendaDocument.IInput['data'];

export async function generateAgenda(data: IGenerateAgendaInput) {
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
