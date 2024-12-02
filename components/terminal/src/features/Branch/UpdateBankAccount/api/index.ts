import { client } from 'src/shared/api/client'
import { Mutations, type ModelTypes } from '@coopenomics/coopjs'

async function updateBranchBankAccount(data: ModelTypes['UpdateBankAccountInput']): Promise<ModelTypes['PaymentMethod']>{
  const {updateBankAccount: result} = await client.Mutation(Mutations.updateBankAccount, {variables: {
    data
  }})

  return result
}

export const api = {
  updateBranchBankAccount
}
