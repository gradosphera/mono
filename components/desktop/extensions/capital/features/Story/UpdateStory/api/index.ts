import type {
  IUpdateStoryInput,
  IUpdateStoryOutput,
} from 'app/extensions/capital/entities/Story/model';
import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

async function updateStory(
  data: IUpdateStoryInput,
): Promise<IUpdateStoryOutput> {
  const { [Mutations.Capital.UpdateStory.name]: result } =
    await client.Mutation(Mutations.Capital.UpdateStory.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  updateStory,
};
