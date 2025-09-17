import { client } from 'src/shared/api/client';
import { Queries, Mutations } from '@coopenomics/sdk';
import type {
  IGetStoriesInput,
  IStoriesPagination,
  ICreateStoryInput,
  ICreateStoryOutput,
} from '../model';

async function loadStories(
  data: IGetStoriesInput,
): Promise<IStoriesPagination> {
  const { [Queries.Capital.GetStories.name]: output } = await client.Query(
    Queries.Capital.GetStories.query,
    {
      variables: data,
    },
  );
  return output;
}

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
  loadStories,
  createStory,
};
