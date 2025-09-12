import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IAddAuthorInput = Mutations.Capital.AddAuthor.IInput['data'];

export function useAddAuthor() {
  const initialAddAuthorInput: IAddAuthorInput = {
    author: '',
    coopname: '',
    project_hash: '',
  };

  const addAuthorInput = ref<IAddAuthorInput>({
    ...initialAddAuthorInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(input: Ref<IAddAuthorInput>, initial: IAddAuthorInput) {
    Object.assign(input.value, initial);
  }

  async function addAuthor(data: IAddAuthorInput) {
    const transaction = await api.addAuthor(data);

    // Сбрасываем addAuthorInput после выполнения addAuthor
    resetInput(addAuthorInput, initialAddAuthorInput);

    return transaction;
  }

  return { addAuthor, addAuthorInput };
}
