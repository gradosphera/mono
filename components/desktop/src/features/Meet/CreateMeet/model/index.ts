import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

export type ICreateMeetInput = Mutations.Meet.CreateAnnualGeneralMeet.IInput['data']
export type ICreateMeetResult = Mutations.Meet.CreateAnnualGeneralMeet.IOutput[typeof Mutations.Meet.CreateAnnualGeneralMeet.name]

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
