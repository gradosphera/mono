import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ISetCreatorsInput = {
  issue_hash: string;
  creators_hashs: string[]; // массив хэшей контрибьюторов
};

export type ISetCreatorsOutput =
  Mutations.Capital.UpdateIssue.IOutput[typeof Mutations.Capital.UpdateIssue.name];

async function setCreators(data: ISetCreatorsInput): Promise<ISetCreatorsOutput> {
  const { [Mutations.Capital.UpdateIssue.name]: result } = await client.Mutation(
    Mutations.Capital.UpdateIssue.mutation,
    {
      variables: {
        data: {
          issue_hash: data.issue_hash,
          creators_hashs: data.creators_hashs,
        },
      },
    },
  );

  return result;
}

export const api = {
  setCreators,
};
