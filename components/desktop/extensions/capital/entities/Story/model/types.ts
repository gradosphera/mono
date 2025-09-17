import type { Queries, Mutations } from '@coopenomics/sdk';

export type IStoriesPagination =
  Queries.Capital.GetStories.IOutput[typeof Queries.Capital.GetStories.name];

export type IStory = IStoriesPagination['items'][0];

export type IGetStoriesInput = Queries.Capital.GetStories.IInput;
export type ICreateStoryInput = Mutations.Capital.CreateStory.IInput['data'];
export type ICreateStoryOutput =
  Mutations.Capital.CreateStory.IOutput[typeof Mutations.Capital.CreateStory.name];
