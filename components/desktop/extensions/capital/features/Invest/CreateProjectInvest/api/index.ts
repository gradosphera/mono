import type {
  ICreateProjectInvestInput,
  ICreateProjectInvestOutput,
} from 'app/extensions/capital/entities/Invest/model';
import type {
  IGenerateDocumentInput,
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createProjectInvest(
  data: ICreateProjectInvestInput,
): Promise<ICreateProjectInvestOutput> {
  const { [Mutations.Capital.CreateProjectInvest.name]: result } =
    await client.Mutation(Mutations.Capital.CreateProjectInvest.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function generateGenerationMoneyInvestStatement(
  data: IGenerateDocumentInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationMoneyInvestStatement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationMoneyInvestStatement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  createProjectInvest,
  generateGenerationMoneyInvestStatement,
};
