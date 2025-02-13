import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function updateBankAccount(data: Mutations.PaymentMethods.UpdateBankAccount.IInput['data']): Promise<Mutations.PaymentMethods.UpdateBankAccount.IOutput[typeof Mutations.PaymentMethods.UpdateBankAccount.name]>{
  console.log('data on update', data)
  const {updateBankAccount: result} = await client.Mutation(Mutations.PaymentMethods.UpdateBankAccount.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  updateBankAccount
}
