import { Mutations } from '@coopenomics/sdk'
import { client } from 'src/shared/api/client'

export type IStartResetKeyInput = Mutations.Accounts.StartResetKey.IInput['data']

async function startResetKey(data: IStartResetKeyInput): Promise<boolean> {
  const {[Mutations.Accounts.StartResetKey.name]: result} = await client.Mutation(Mutations.Accounts.StartResetKey.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  startResetKey
}
