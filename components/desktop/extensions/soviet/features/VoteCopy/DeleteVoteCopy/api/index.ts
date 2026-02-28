import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function deleteVoteCopy(id: string): Promise<boolean> {
  const { [Mutations.Soviet.DeleteVoteCopy.name]: result } = await client.Mutation(
    Mutations.Soviet.DeleteVoteCopy.mutation,
    { variables: { id } },
  )
  return result
}

export const api = {
  deleteVoteCopy,
}
