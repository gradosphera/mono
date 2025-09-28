import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateCapitalizationAgreement(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateCapitalizationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateCapitalizationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

// TODO: Временная функция для отправки соглашения через блокчейн
// В будущем должна быть заменена на отправку через API контроллера
async function sendCapitalProgramAgreement(data: {
  coopname: string;
  username: string;
  agreement_type: string;
  document: any;
}): Promise<void> {
  // Временная реализация - отправка напрямую на блокчейн
  // TODO: Заменить на отправку через API контроллера
  console.warn('Временная отправка соглашения через блокчейн. Нужно заменить на API контроллера');

  // Имитируем отправку через блокчейн
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('Соглашение о целевой потребительской программе отправлено:', data);
}

export const api = {
  generateCapitalizationAgreement,
  sendCapitalProgramAgreement,
};
