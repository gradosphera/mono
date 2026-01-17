import type { IRegisterContributorOutput } from 'app/extensions/capital/entities/Contributor/model';
import type { IRegisterContributorInput, IGenerateGenerationAgreementInput } from '../model';
import type {
  IGenerateDocumentOptionsInput,
  IGeneratedDocumentOutput,
} from 'src/shared/lib/types/document';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function registerContributor(
  data: IRegisterContributorInput,
): Promise<IRegisterContributorOutput> {
  const { [Mutations.Capital.RegisterContributor.name]: result } =
    await client.Mutation(Mutations.Capital.RegisterContributor.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function generateGenerationAgreement(
  data: IGenerateGenerationAgreementInput,
  options?: IGenerateDocumentOptionsInput,
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateGenerationAgreement.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateGenerationAgreement.mutation, {
      variables: {
        data,
        options,
      },
    });

  return result;
}

export const api = {
  registerContributor,
  generateGenerationAgreement,
};
