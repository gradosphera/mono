import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IGenerateSovietDecisionInput = Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.IInput['data'];

export async function generateSovietDecision(data: IGenerateSovietDecisionInput) {
  const { [Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.name]: result } = await client.Mutation(
    Mutations.Meet.GenerateSovietDecisionOnAnnualMeetDocument.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}
