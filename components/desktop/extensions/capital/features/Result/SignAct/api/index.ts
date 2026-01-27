import type {
  ISignActAsContributorInput,
  ISignActAsContributorOutput,
  ISignActAsChairmanInput,
  ISignActAsChairmanOutput,
} from '../model';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';

import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function generateResultContributionAct(
  data: Mutations.Capital.GenerateResultContributionAct.IInput['data'],
): Promise<IGeneratedDocumentOutput> {
  const { [Mutations.Capital.GenerateResultContributionAct.name]: result } =
    await client.Mutation(Mutations.Capital.GenerateResultContributionAct.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function signActAsContributor(data: ISignActAsContributorInput): Promise<ISignActAsContributorOutput> {
  const { [Mutations.Capital.SignActAsContributor.name]: result } = await client.Mutation(
    Mutations.Capital.SignActAsContributor.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

async function signActAsChairman(data: ISignActAsChairmanInput): Promise<ISignActAsChairmanOutput> {
  const { [Mutations.Capital.SignActAsChairman.name]: result } = await client.Mutation(
    Mutations.Capital.SignActAsChairman.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  generateResultContributionAct,
  signActAsContributor,
  signActAsChairman,
};
