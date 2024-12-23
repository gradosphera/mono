import { Mutations } from '@coopenomics/coopjs'
import { client } from 'src/shared/api/client';

export function usePublishProjectOfFreeDecision() {

  async function publishProjectOfFreeDecision(data: Mutations.Decisions.PublishProjectOfFreeDecision.IInput): Promise<Mutations.Decisions.PublishProjectOfFreeDecision.IOutput[typeof Mutations.Decisions.PublishProjectOfFreeDecision.name]> {
    const { [Mutations.Decisions.PublishProjectOfFreeDecision.name]: result } = await client.Mutation(
      Mutations.Decisions.PublishProjectOfFreeDecision.mutation,
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
