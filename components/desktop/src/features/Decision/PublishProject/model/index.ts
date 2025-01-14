import { Mutations } from '@coopenomics/sdk'
import { client } from 'src/shared/api/client';

export function usePublishProjectOfFreeDecision() {

  async function publishProjectOfFreeDecision(data: Mutations.FreeDecisions.PublishProjectOfFreeDecision.IInput['data']): Promise<Mutations.FreeDecisions.PublishProjectOfFreeDecision.IOutput[typeof Mutations.FreeDecisions.PublishProjectOfFreeDecision.name]> {
    const { [Mutations.FreeDecisions.PublishProjectOfFreeDecision.name]: result } = await client.Mutation(
      Mutations.FreeDecisions.PublishProjectOfFreeDecision.mutation,
      {
        variables: {
          data,
        },
      }
    );

    return result
  }

  return {
    publishProjectOfFreeDecision,
  }
}
