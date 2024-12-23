import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/coopjs'

async function updateBankAccount(data: Mutations.PaymentMethods.UpdateBankAccount.IInput): Promise<Mutations.PaymentMethods.UpdateBankAccount.IOutput[typeof Mutations.PaymentMethods.UpdateBankAccount.name]>{
  const {updateBankAccount: result} = await client.Mutation(Mutations.PaymentMethods.UpdateBankAccount.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  updateBankAccount
}
