import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IStoriesPagination, IGetStoriesInput } from './types';

const namespace = 'storyStore';

interface IStoryStore {
  stories: Ref<IStoriesPagination | null>;
  loadStories: (data: IGetStoriesInput) => Promise<void>;
}

export const useStoryStore = defineStore(namespace, (): IStoryStore => {
  const stories = ref<IStoriesPagination | null>(null);

  const loadStories = async (data: IGetStoriesInput): Promise<void> => {
    const loadedData = await api.loadStories(data);
    stories.value = loadedData;
  };

  return {
    stories,
    loadStories,
  };
});
