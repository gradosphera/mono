import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

export type IStartProjectInput = Mutations.Capital.StartProject.IInput['data'];

export function useStartProject() {
  const initialStartProjectInput: IStartProjectInput = {
    coopname: '',
    project_hash: '',
  };

  const startProjectInput = ref<IStartProjectInput>({
    ...initialStartProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IStartProjectInput>,
    initial: IStartProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function startProject(data: IStartProjectInput) {
    const transaction = await api.startProject(data);

    // Сбрасываем startProjectInput после выполнения startProject
    resetInput(startProjectInput, initialStartProjectInput);

    return transaction;
  }

  return { startProject, startProjectInput };
}
