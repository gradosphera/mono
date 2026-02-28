import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import type { ICreateVoteCopyInput } from '../model'

type CreateResult = Mutations.Soviet.CreateVoteCopy.IOutput[typeof Mutations.Soviet.CreateVoteCopy.name]

async function createVoteCopy(data: ICreateVoteCopyInput): Promise<CreateResult> {
  const { [Mutations.Soviet.CreateVoteCopy.name]: result } = await client.Mutation(
    Mutations.Soviet.CreateVoteCopy.mutation,
    { variables: { data } },
  )
  return result
}

export const api = {
  createVoteCopy,
}
