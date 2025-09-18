import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IStoriesPagination, IGetStoriesInput, IStory } from './types';

const namespace = 'storyStore';

interface IStoryStore {
  stories: Ref<IStoriesPagination | null>;
  loadStories: (data: IGetStoriesInput) => Promise<void>;
  addStoryToList: (storyData: IStory) => void;
  removeStoryFromList: (storyHash: string) => void;
  updateStoryInPlace: (storyData: IStory) => void;
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

  const updateStoryInPlace = (storyData: IStory) => {
    if (stories.value) {
      // Ищем историю по _id и заменяем её на месте
      const existingIndex = stories.value.items.findIndex(
        (story) => story._id === storyData._id,
      );

      if (existingIndex !== -1) {
        // Заменяем объект на месте, без пересортировки
        stories.value.items[existingIndex] = storyData;
      }
    }
  };

  const removeStoryFromList = (storyHash: string) => {
    if (stories.value) {
      // Ищем историю по story_hash
      const storyIndex = stories.value.items.findIndex(
        (story) => story.story_hash === storyHash,
      );

      if (storyIndex !== -1) {
        // Удаляем историю из списка
        stories.value.items.splice(storyIndex, 1);
        // Уменьшаем общее количество
        stories.value.totalCount -= 1;
      }
    }
  };

  return {
    stories,
    loadStories,
    addStoryToList,
    updateStoryInPlace,
    removeStoryFromList,
  };
});
