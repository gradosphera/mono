import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useStoryStore,
  type ICreateStoryOutput,
} from 'app/extensions/capital/entities/Story/model';

export type ICreateStoryInput = Mutations.Capital.CreateStory.IInput['data'];

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
    const transaction = await api.createStory(data);

    // Добавляем историю в начало списка без перезагрузки всего списка
    store.addStoryToList(transaction);

    // Сбрасываем createStoryInput после выполнения createStory
    resetInput(createStoryInput, initialCreateStoryInput);

    return transaction;
  }

  return { createStory, createStoryInput };
}
