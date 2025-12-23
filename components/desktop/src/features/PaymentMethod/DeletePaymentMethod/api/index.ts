import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'

async function deletePaymentMethod(data: Mutations.PaymentMethods.DeletePaymentMethod.IInput['data']): Promise<Mutations.PaymentMethods.DeletePaymentMethod.IOutput[typeof Mutations.PaymentMethods.DeletePaymentMethod.name]>{
  const {[Mutations.PaymentMethods.DeletePaymentMethod.name]: result} = await client.Mutation(Mutations.PaymentMethods.DeletePaymentMethod.mutation, {variables: {
    data
  }})

  return result
}

export const api = {
  deletePaymentMethod
}
