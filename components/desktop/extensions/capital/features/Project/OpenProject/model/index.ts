import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IOpenProjectInput = Mutations.Capital.OpenProject.IInput['data'];

export function useOpenProject() {
  const initialOpenProjectInput: IOpenProjectInput = {
    coopname: '',
    project_hash: '',
  };

  const openProjectInput = ref<IOpenProjectInput>({
    ...initialOpenProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IOpenProjectInput>,
    initial: IOpenProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function openProject(data: IOpenProjectInput) {
    const transaction = await api.openProject(data);

    // Сбрасываем openProjectInput после выполнения openProject
    resetInput(openProjectInput, initialOpenProjectInput);

    return transaction;
  }

  return { openProject, openProjectInput };
}
