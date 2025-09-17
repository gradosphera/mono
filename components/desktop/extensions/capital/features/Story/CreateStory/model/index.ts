import { ref, type Ref } from 'vue';
import {
  useStoryStore,
  type ICreateStoryInput,
  type ICreateStoryOutput,
} from 'app/extensions/capital/entities/Story/model';

export function useCreateStory() {
  const store = useStoryStore();

  const initialCreateStoryInput: ICreateStoryInput = {
    created_by: '',
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
    const transaction = await store.createStory(data);

    // Сбрасываем createStoryInput после выполнения createStory
    resetInput(createStoryInput, initialCreateStoryInput);

    return transaction;
  }

  return { createStory, createStoryInput };
}
