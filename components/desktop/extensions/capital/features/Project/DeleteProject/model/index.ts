import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IDeleteProjectInput =
  Mutations.Capital.DeleteProject.IInput['data'];

export function useDeleteProject() {
  const initialDeleteProjectInput: IDeleteProjectInput = {
    coopname: '',
    project_hash: '',
  };

  const deleteProjectInput = ref<IDeleteProjectInput>({
    ...initialDeleteProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IDeleteProjectInput>,
    initial: IDeleteProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function deleteProject(data: IDeleteProjectInput) {
    const transaction = await api.deleteProject(data);

    // Сбрасываем deleteProjectInput после выполнения deleteProject
    resetInput(deleteProjectInput, initialDeleteProjectInput);

    return transaction;
  }

  return { deleteProject, deleteProjectInput };
}
