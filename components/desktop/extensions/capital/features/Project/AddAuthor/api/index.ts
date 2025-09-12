import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IAddAuthorInput = Mutations.Capital.AddAuthor.IInput['data'];
export type IAddAuthorOutput =
  Mutations.Capital.AddAuthor.IOutput[typeof Mutations.Capital.AddAuthor.name];

async function addAuthor(data: IAddAuthorInput): Promise<IAddAuthorOutput> {
  const { [Mutations.Capital.AddAuthor.name]: result } = await client.Mutation(
    Mutations.Capital.AddAuthor.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  addAuthor,
};
