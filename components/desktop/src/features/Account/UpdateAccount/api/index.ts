import type { IBranch } from 'src/entities/Branch/model'
import type { ICreateBranchInput } from '../model'
import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function updateAccount(data: any): Promise<any>{
  const {[Mutations.Accounts.UpdateAccount.name]: result} = await client.Mutation(Mutations.Accounts.UpdateAccount.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  updateAccount
}