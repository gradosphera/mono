import type {
  IDeleteStoryOutput,
  IDeleteStoryInput,
} from 'app/extensions/capital/entities/Story/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function deleteStory(
  data: IDeleteStoryInput,
): Promise<IDeleteStoryOutput> {
  const { [Mutations.Capital.DeleteStory.name]: result } =
    await client.Mutation(Mutations.Capital.DeleteStory.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  deleteStory,
};
