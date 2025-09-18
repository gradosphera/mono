import type {
  ICreateStoryOutput,
  ICreateStoryInput,
} from 'app/extensions/capital/entities/Story/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function createStory(
  data: ICreateStoryInput,
): Promise<ICreateStoryOutput> {
  const { [Mutations.Capital.CreateStory.name]: result } =
    await client.Mutation(Mutations.Capital.CreateStory.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createStory,
};
