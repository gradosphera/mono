import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IVoteOnMeetInput = Mutations.Meet.VoteOnAnnualGeneralMeet.IInput['data'];

export async function voteOnMeet(data: IVoteOnMeetInput) {
  const { [Mutations.Meet.VoteOnAnnualGeneralMeet.name]: result } = await client.Mutation(
    Mutations.Meet.VoteOnAnnualGeneralMeet.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}
