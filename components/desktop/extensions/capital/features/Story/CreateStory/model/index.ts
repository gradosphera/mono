import { ref, type Ref } from 'vue';
import {
  useStoryStore,
  type ICreateStoryInput,
  type ICreateStoryOutput,
} from 'app/extensions/capital/entities/Story/model';
import { api } from '../api';
import { generateUniqueHash } from 'src/shared/lib/utils/generateUniqueHash';
import { useSystemStore } from 'src/entities/System/model/store';

export function useCreateStory() {
  const store = useStoryStore();

  const initialCreateStoryInput: ICreateStoryInput = {
    story_hash: '',
    coopname: '',
    title: '',
  };

  const createStoryInput = ref<ICreateStoryInput>({
    ...initialCreateStoryInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateStoryInput>,
    initial: ICreateStoryInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createStory(
    data: ICreateStoryInput,
  ): Promise<ICreateStoryOutput> {
    const { info } = useSystemStore();
    data.coopname = info.coopname;
    data.story_hash = await generateUniqueHash();
    const transaction = await api.createStory(data);
    store.addStoryToList(transaction);
    // Сбрасываем createStoryInput после выполнения createStory
    resetInput(createStoryInput, initialCreateStoryInput);

    return transaction;
  }

  return { createStory, createStoryInput };
}
