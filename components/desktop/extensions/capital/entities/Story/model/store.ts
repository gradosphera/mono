import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IStoriesPagination,
  IGetStoriesInput,
  IStory,
  ICreateStoryInput,
  ICreateStoryOutput,
} from './types';

const namespace = 'storyStore';

interface IStoryStore {
  stories: Ref<IStoriesPagination | null>;
  loadStories: (data: IGetStoriesInput) => Promise<void>;
  addStoryToList: (storyData: IStory) => void;
  createStory: (data: ICreateStoryInput) => Promise<ICreateStoryOutput>;
}

export const useStoryStore = defineStore(namespace, (): IStoryStore => {
  const stories = ref<IStoriesPagination | null>(null);

  const loadStories = async (data: IGetStoriesInput): Promise<void> => {
    const loadedData = await api.loadStories(data);
    stories.value = loadedData;
  };

  const addStoryToList = (storyData: IStory) => {
    if (stories.value) {
      // Ищем существующую историю по _id
      const existingIndex = stories.value.items.findIndex(
        (story) => story._id === storyData._id,
      );

      if (existingIndex !== -1) {
        // Заменяем существующую историю
        stories.value.items[existingIndex] = storyData;
      } else {
        // Добавляем новую историю в начало списка
        stories.value.items = [storyData, ...stories.value.items];
        // Увеличиваем общее количество
        stories.value.totalCount += 1;
      }
    }
  };

  const createStory = async (
    data: ICreateStoryInput,
  ): Promise<ICreateStoryOutput> => {
    const result = await api.createStory(data);

    // Добавляем созданную историю в список
    addStoryToList(result);

    return result;
  };

  return {
    stories,
    loadStories,
    addStoryToList,
    createStory,
  };
});
