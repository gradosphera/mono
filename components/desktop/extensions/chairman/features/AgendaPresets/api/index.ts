import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

export type GeneratedDocument = Mutations.Documents.GenerateDocument.IOutput[typeof Mutations.Documents.GenerateDocument.name]
export type CreatedProject = Mutations.FreeDecisions.CreateProjectOfFreeDecision.IOutput[typeof Mutations.FreeDecisions.CreateProjectOfFreeDecision.name]
export type GeneratedProjectDocument = Mutations.FreeDecisions.GenerateProjectOfFreeDecision.IOutput[typeof Mutations.FreeDecisions.GenerateProjectOfFreeDecision.name]

const generateDocument = async (input: Mutations.Documents.GenerateDocument.IInput['input']) => {
  const { [Mutations.Documents.GenerateDocument.name]: document } = await client.Mutation(
    Mutations.Documents.GenerateDocument.mutation,
    {
      variables: { input },
    }
  )
  return document
}

const createProjectOfFreeDecision = async (data: Mutations.FreeDecisions.CreateProjectOfFreeDecision.IInput['data']) => {
  const { [Mutations.FreeDecisions.CreateProjectOfFreeDecision.name]: project } = await client.Mutation(
    Mutations.FreeDecisions.CreateProjectOfFreeDecision.mutation,
    {
      variables: { data },
    }
  )
  return project
}

const generateProjectOfFreeDecisionDocument = async (data: Mutations.FreeDecisions.GenerateProjectOfFreeDecision.IInput['data']) => {
  const { [Mutations.FreeDecisions.GenerateProjectOfFreeDecision.name]: document } = await client.Mutation(
    Mutations.FreeDecisions.GenerateProjectOfFreeDecision.mutation,
    {
      variables: { data },
    }
  )
  return document
}

const publishProjectOfFreeDecision = async (data: Mutations.FreeDecisions.PublishProjectOfFreeDecision.IInput['data']) => {
  await client.Mutation(Mutations.FreeDecisions.PublishProjectOfFreeDecision.mutation, {
    variables: { data },
  })
}

export const api = {
  generateDocument,
  createProjectOfFreeDecision,
  generateProjectOfFreeDecisionDocument,
  publishProjectOfFreeDecision,
}
