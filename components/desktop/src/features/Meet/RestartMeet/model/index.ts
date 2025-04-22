import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IRestartMeetInput = Mutations.Meet.RestartAnnualGeneralMeet.IInput['data'];
export type IRestartMeetResult = Mutations.Meet.RestartAnnualGeneralMeet.IOutput[typeof Mutations.Meet.RestartAnnualGeneralMeet.name];

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
