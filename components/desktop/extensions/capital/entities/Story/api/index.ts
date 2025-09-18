import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetStoriesInput,
  IStoriesPagination,
  IGetStoryInput,
  IGetStoryOutput,
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

async function loadStory(data: IGetStoryInput): Promise<IGetStoryOutput> {
  const { [Queries.Capital.GetStory.name]: output } = await client.Query(
    Queries.Capital.GetStory.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

export const api = {
  loadStories,
  loadStory,
};
