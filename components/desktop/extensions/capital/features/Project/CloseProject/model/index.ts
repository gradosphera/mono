import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type ICloseProjectInput = Mutations.Capital.CloseProject.IInput['data'];

export function useCloseProject() {
  const store = useProjectStore();

  const initialCloseProjectInput: ICloseProjectInput = {
    coopname: '',
    project_hash: '',
  };

  const closeProjectInput = ref<ICloseProjectInput>({
    ...initialCloseProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICloseProjectInput>,
    initial: ICloseProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function closeProject(data: ICloseProjectInput) {
    const updatedProject = await api.closeProject(data);

    // Обновляем проект в store после закрытия
    store.addProjectToList(updatedProject);

    // Сбрасываем closeProjectInput после выполнения closeProject
    resetInput(closeProjectInput, initialCloseProjectInput);

    return updatedProject;
  }

  return { closeProject, closeProjectInput };
}
