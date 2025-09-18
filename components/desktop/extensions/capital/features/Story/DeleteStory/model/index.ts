import {
  useStoryStore,
  type IDeleteStoryInput,
  type IDeleteStoryOutput,
} from 'app/extensions/capital/entities/Story/model';
import { api } from '../api';

export function useDeleteStory() {
  const store = useStoryStore();

  async function deleteStory(
    data: IDeleteStoryInput,
  ): Promise<IDeleteStoryOutput> {
    const result = await api.deleteStory(data);

    if (result) {
      store.removeStoryFromList(data.story_hash);
    }

    return result;
  }

  return { deleteStory };
}
