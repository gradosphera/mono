import { ref, type Ref } from 'vue';
import { type Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useStoryStore,
  type IUpdateStoryOutput,
} from 'app/extensions/capital/entities/Story/model';

export type IUpdateStoryInput = Mutations.Capital.UpdateStory.IInput['data'];

export function useUpdateStory() {
  const store = useStoryStore();

  const initialUpdateStoryInput: Partial<IUpdateStoryInput> = {};

  const updateStoryInput = ref<Partial<IUpdateStoryInput>>({
    ...initialUpdateStoryInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<Partial<IUpdateStoryInput>>,
    initial: Partial<IUpdateStoryInput>,
  ) {
    Object.assign(input.value, initial);
  }

  async function updateStory(
    data: IUpdateStoryInput,
  ): Promise<IUpdateStoryOutput> {
    const transaction = await api.updateStory(data);

    // Добавляем/обновляем историю в списке
    store.updateStoryInPlace(transaction);

    // Сбрасываем updateStoryInput после выполнения updateStory
    resetInput(updateStoryInput, initialUpdateStoryInput);

    return transaction;
  }

  return { updateStory, updateStoryInput };
}
