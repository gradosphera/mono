import type {
  IPushResultOutput,
  IPushResultInput,
} from 'app/extensions/capital/entities/Result/model';
import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function pushResult(data: IPushResultInput): Promise<IPushResultOutput> {
  const { [Mutations.Capital.PushResult.name]: result } = await client.Mutation(
    Mutations.Capital.PushResult.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

async function generateResultContributionStatement(
  data: Mutations.Capital.GenerateResultContributionStatement.IInput['data'],
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateResultContributionStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateResultContributionStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  pushResult,
  generateResultContributionStatement,
};
