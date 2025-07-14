import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function addParticipant(
  data: Mutations.Participants.AddParticipant.IInput['data'],
): Promise<Mutations.Participants.AddParticipant.IOutput['addParticipant']> {
  const { [Mutations.Participants.AddParticipant.name]: result } =
    await client.Mutation(Mutations.Participants.AddParticipant.mutation, {
      variables: { data },
    });

  return result;
}

export const api = {
  addParticipant,
};
