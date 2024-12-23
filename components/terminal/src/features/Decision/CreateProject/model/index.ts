import { Mutations } from '@coopenomics/coopjs'
import type { ICreatedProjectDecisionData, IGeneratedProjectDecisionDocument } from 'src/entities/Decision/model';
import { client } from 'src/shared/api/client';

export function useCreateProjectOfFreeDecision() {

  async function createProjectOfFreeDecision(data: Mutations.Decisions.CreateProjectOfFreeDecision.IInput): Promise<ICreatedProjectDecisionData> {
    const { [Mutations.Decisions.CreateProjectOfFreeDecision.name]: project } = await client.Mutation(
      Mutations.Decisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: {
          data,
        },
      }
    );

    return project
  }

  async function generateProjectDocumentOfFreeDecision(data: Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.IInput): Promise<IGeneratedProjectDecisionDocument> {
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
    createProjectOfFreeDecision,
    generateProjectDocumentOfFreeDecision,
    publishProjectOfFreeDecision
  }
}
