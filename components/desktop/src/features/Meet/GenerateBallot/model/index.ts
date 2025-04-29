import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IGenerateBallotInput = Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument.IInput['data'];
export type IGenerateBallotResult = Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument.IOutput[typeof Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument.name];

export async function generateBallot(data: IGenerateBallotInput): Promise<IGenerateBallotResult> {
  const { [Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument.name]: result } = await client.Mutation(
    Mutations.Meet.GenerateBallotForAnnualGeneralMeetDocument.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}
