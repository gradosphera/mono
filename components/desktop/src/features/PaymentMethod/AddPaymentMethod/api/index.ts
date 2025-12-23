import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function addPaymentMethod(data: Mutations.PaymentMethods.AddPaymentMethod.IInput['data']): Promise<Mutations.PaymentMethods.AddPaymentMethod.IOutput[typeof Mutations.PaymentMethods.AddPaymentMethod.name]>{
  const {[Mutations.PaymentMethods.AddPaymentMethod.name]: result} = await client.Mutation(Mutations.PaymentMethods.AddPaymentMethod.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  addPaymentMethod
}
