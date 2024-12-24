import { Mutations } from '@coopenomics/coopjs'
import type { ICreatedProjectDecisionData, IGeneratedProjectDecisionDocument } from 'src/entities/Decision/model';
import { client } from 'src/shared/api/client';
import { useSignDocument } from 'src/shared/lib/document';
import { ref, type Ref } from 'vue';

export type ICreateProjectDecisionData = Mutations.Decisions.CreateProjectOfFreeDecision.IInput

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

    const signedDocument = await signDocument(generatedDocument)

    await publishProjectOfFreeDecision({
      coopname: coopname,
      document: signedDocument,
      meta: '',
      username: username
    })
  }

  async function createProjectOfFreeDecision(): Promise<ICreatedProjectDecisionData> {
    const { [Mutations.Decisions.CreateProjectOfFreeDecision.name]: project } = await client.Mutation(
      Mutations.Decisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: {
          data: createProjectInput.value,
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
    createProjectInput,
    createProject,
    createProjectOfFreeDecision,
    generateProjectDocumentOfFreeDecision,
    publishProjectOfFreeDecision
  }
}
