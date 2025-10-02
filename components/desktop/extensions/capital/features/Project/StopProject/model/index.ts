import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type IStopProjectInput = Mutations.Capital.StopProject.IInput['data'];

export function useStopProject() {
  const store = useProjectStore();

  const initialStopProjectInput: IStopProjectInput = {
    coopname: '',
    project_hash: '',
  };

  const stopProjectInput = ref<IStopProjectInput>({
    ...initialStopProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IStopProjectInput>,
    initial: IStopProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function stopProject(data: IStopProjectInput) {
    const updatedProject = await api.stopProject(data);

    // Обновляем проект в store после остановки
    store.addProjectToList(updatedProject);

    // Сбрасываем stopProjectInput после выполнения stopProject
    resetInput(stopProjectInput, initialStopProjectInput);

    return updatedProject;
  }

  return { stopProject, stopProjectInput };
}
