import { Mutations } from '@coopenomics/sdk'
import { client } from 'src/shared/api/client'

export type IResetKeyInput = Mutations.Accounts.ResetKey.IInput['data']

async function resetKey(data: IResetKeyInput): Promise<boolean> {
  const {[Mutations.Accounts.ResetKey.name]: result} = await client.Mutation(Mutations.Accounts.ResetKey.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  resetKey
}
