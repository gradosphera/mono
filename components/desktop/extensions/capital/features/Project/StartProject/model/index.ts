import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type IStartProjectInput = Mutations.Capital.StartProject.IInput['data'];

export function useStartProject() {
  const store = useProjectStore();

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
    const updatedProject = await api.startProject(data);

    // Обновляем проект в store после запуска
    store.addProjectToList(updatedProject);

    // Сбрасываем startProjectInput после выполнения startProject
    resetInput(startProjectInput, initialStartProjectInput);

    return updatedProject;
  }

  return { startProject, startProjectInput };
}
