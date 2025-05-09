import { Mutations } from '@coopenomics/sdk'
import type { ICreatedProjectDecisionData, IGeneratedProjectDecisionDocument } from 'src/entities/Decision/model';
import { client } from 'src/shared/api/client';
import { useSignDocument } from 'src/shared/lib/document';
import { ref, type Ref } from 'vue';

export type ICreateProjectDecisionData = Mutations.FreeDecisions.CreateProjectOfFreeDecision.IInput['data']

export function useCreateProjectOfFreeDecision() {

  const createProjectInput: Ref<ICreateProjectDecisionData> = ref({
    decision: '',
    question: ''
  });

  async function createProject(coopname: string, username: string){
    const createdProject = await createProjectOfFreeDecision()

    const generatedDocument = await generateProjectDocumentOfFreeDecision({
      coopname: coopname,
      project_id: createdProject.id,
      username: username
    })

    const { signDocument } = useSignDocument()

    const signedDocument = await signDocument(generatedDocument, username)

    await publishProjectOfFreeDecision({
      coopname: coopname,
      document: signedDocument,
      meta: '',
      username: username
    })
  }

  async function createProjectOfFreeDecision(): Promise<ICreatedProjectDecisionData> {
    const { [Mutations.FreeDecisions.CreateProjectOfFreeDecision.name]: project } = await client.Mutation(
      Mutations.FreeDecisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: {
          data: createProjectInput.value,
        },
      }
    );

    return project
  }

  async function generateProjectDocumentOfFreeDecision(data: Mutations.FreeDecisions.GenerateProjectOfFreeDecision.IInput['data']): Promise<IGeneratedProjectDecisionDocument> {
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
    createProjectInput,
    createProject,
    createProjectOfFreeDecision,
    generateProjectDocumentOfFreeDecision,
    publishProjectOfFreeDecision
  }
}
