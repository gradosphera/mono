import type { Queries, Mutations } from '@coopenomics/sdk';

export type IStoriesPagination =
  Queries.Capital.GetStories.IOutput[typeof Queries.Capital.GetStories.name];

export type IStory = IStoriesPagination['items'][0];

export type IGetStoriesInput = Queries.Capital.GetStories.IInput;
export type IGetStoryInput = Queries.Capital.GetStory.IInput['data'];
export type IGetStoryOutput =
  Queries.Capital.GetStory.IOutput[typeof Queries.Capital.GetStory.name];
export type ICreateStoryInput = Mutations.Capital.CreateStory.IInput['data'];
export type ICreateStoryOutput =
  Mutations.Capital.CreateStory.IOutput[typeof Mutations.Capital.CreateStory.name];

export type IUpdateStoryInput = Mutations.Capital.UpdateStory.IInput['data'];
export type IUpdateStoryOutput =
  Mutations.Capital.UpdateStory.IOutput[typeof Mutations.Capital.UpdateStory.name];

export type IDeleteStoryInput = Mutations.Capital.DeleteStory.IInput['data'];
export type IDeleteStoryOutput =
  Mutations.Capital.DeleteStory.IOutput[typeof Mutations.Capital.DeleteStory.name];
