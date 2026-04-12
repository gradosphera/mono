import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

export type ISetDevelopmentRepositoryUrlInput =
  Mutations.Capital.SetProjectDevelopmentRepositoryUrl.IInput['data']

export type ISetDevelopmentRepositoryUrlOutput = Mutations.Capital.SetProjectDevelopmentRepositoryUrl.IOutput[typeof Mutations.Capital.SetProjectDevelopmentRepositoryUrl.name]

export async function setDevelopmentRepositoryUrl(
  data: ISetDevelopmentRepositoryUrlInput,
): Promise<ISetDevelopmentRepositoryUrlOutput> {
  const { [Mutations.Capital.SetProjectDevelopmentRepositoryUrl.name]: result } =
    await client.Mutation(Mutations.Capital.SetProjectDevelopmentRepositoryUrl.mutation, {
      variables: { data },
    })
  return result
}
