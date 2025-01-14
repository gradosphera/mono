import { Mutations } from '@coopenomics/coopjs'
import { client } from 'src/shared/api/client';

export function useGenerateProjectDocumentOfFreeDecision() {

  async function generateProjectDocumentOfFreeDecision(data: Mutations.FreeDecisions.GenerateProjectOfFreeDecision.IInput['data']): Promise<Mutations.FreeDecisions.GenerateProjectOfFreeDecision.IOutput[typeof Mutations.FreeDecisions.GenerateProjectOfFreeDecision.name]> {
    const { [Mutations.FreeDecisions.GenerateProjectOfFreeDecision.name]: document } = await client.Mutation(
      Mutations.FreeDecisions.GenerateProjectOfFreeDecision.mutation,
      {
        variables: {
          data,
        },
      }
    );

    return document
  }

  return {
    generateProjectDocumentOfFreeDecision,
  }
}
