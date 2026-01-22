import { client } from 'src/shared/api/client'
import { Mutations } from '@coopenomics/sdk'
import type { IGenerateRegistrationDocumentsInput, IGenerateRegistrationDocumentsOutput } from '../model'

/**
 * Генерация всех документов регистрации для пайщика
 */
async function generateRegistrationDocuments(
  data: IGenerateRegistrationDocumentsInput
): Promise<IGenerateRegistrationDocumentsOutput> {

  const { [Mutations.Registration.GenerateRegistrationDocuments.name]: output } =
    await client.Mutation(Mutations.Registration.GenerateRegistrationDocuments.mutation, {
      variables: {
        data,
      },
    })

  return output
}

export const api = {
  generateRegistrationDocuments
}
