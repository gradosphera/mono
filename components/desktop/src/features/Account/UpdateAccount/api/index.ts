import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function updateAccount(data: Mutations.Accounts.UpdateAccount.IInput['data']): Promise<Mutations.Accounts.UpdateAccount.IOutput[[typeof Mutations.Accounts.UpdateAccount.name][number]]>{
  const {[Mutations.Accounts.UpdateAccount.name]: result} = await client.Mutation(Mutations.Accounts.UpdateAccount.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  updateAccount
}
