import { client } from 'src/shared/api/client';
import { Queries, Mutations } from '@coopenomics/sdk';

/**
 * Получить подписки пользователя у провайдера
 */
export async function loadProviderSubscriptions() {
  const { [Queries.System.GetProviderSubscriptions.name]: subscriptions } =
    await client.Query(Queries.System.GetProviderSubscriptions.query);

  return subscriptions;
}

/**
 * Генерирует документ для конвертации в AXON
 */
export async function generateConvertToAxonStatement(data: Mutations.Provider.GenerateConvertToAxonStatement.IInput['data'], options?: Mutations.Provider.GenerateConvertToAxonStatement.IInput['options']) {
  const { [Mutations.Provider.GenerateConvertToAxonStatement.name]: generatedDocument } = await client.Mutation(
    Mutations.Provider.GenerateConvertToAxonStatement.mutation,
    {
      variables: {
        data,
        options
      }
    }
  );

  return generatedDocument;
}

/**
 * Обрабатывает подписанный документ конвертации в AXON
 */
export async function processConvertToAxonStatement(signedDocument: Mutations.Provider.ProcessConvertToAxonStatement.IInput['signedDocument'], convertAmount: string) {
  const { [Mutations.Provider.ProcessConvertToAxonStatement.name]: result } = await client.Mutation(
    Mutations.Provider.ProcessConvertToAxonStatement.mutation,
    {
      variables: {
        signedDocument,
        convertAmount
      }
    }
  );

  return result;
}
