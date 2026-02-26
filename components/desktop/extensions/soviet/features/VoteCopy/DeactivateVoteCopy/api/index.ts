import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function deactivateVoteCopy(id: string): Promise<{ is_active: boolean }> {
  const { [Mutations.Soviet.DeactivateVoteCopy.name]: result } = await client.Mutation(
    Mutations.Soviet.DeactivateVoteCopy.mutation,
    { variables: { id } },
  )
  return result
}

export const api = {
  deactivateVoteCopy,
}
