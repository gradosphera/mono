import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IRefreshProjectInput =
  Mutations.Capital.RefreshProject.IInput['data'];

export function useRefreshProject() {
  const initialRefreshProjectInput: IRefreshProjectInput = {
    coopname: '',
    project_hash: '',
    username: '',
  };

  const refreshProjectInput = ref<IRefreshProjectInput>({
    ...initialRefreshProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IRefreshProjectInput>,
    initial: IRefreshProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function refreshProject(data: IRefreshProjectInput) {
    const transaction = await api.refreshProject(data);

    // Сбрасываем refreshProjectInput после выполнения refreshProject
    resetInput(refreshProjectInput, initialRefreshProjectInput);

    return transaction;
  }

  return { refreshProject, refreshProjectInput };
}
