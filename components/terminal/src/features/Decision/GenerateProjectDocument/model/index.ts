import { Mutations } from '@coopenomics/coopjs'
import { client } from 'src/shared/api/client';

export function useGenerateProjectDocumentOfFreeDecision() {

  async function generateProjectDocumentOfFreeDecision(data: Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.IInput): Promise<Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.IOutput[typeof Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.name]> {
    const { [Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.name]: document } = await client.Mutation(
      Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.mutation,
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
