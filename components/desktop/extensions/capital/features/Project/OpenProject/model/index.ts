import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type IOpenProjectInput = Mutations.Capital.OpenProject.IInput['data'];

export function useOpenProject() {
  const store = useProjectStore();

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
    const updatedProject = await api.openProject(data);

    // Обновляем проект в store после открытия
    store.addProjectToList(updatedProject);

    // Сбрасываем openProjectInput после выполнения openProject
    resetInput(openProjectInput, initialOpenProjectInput);

    return updatedProject;
  }

  return { openProject, openProjectInput };
}
