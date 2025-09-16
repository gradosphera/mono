import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useProjectStore,
  type ICreateProjectOutput,
} from 'app/extensions/capital/entities/Project/model';

export type ICreateProjectInput =
  Mutations.Capital.CreateProject.IInput['data'];

export function useCreateProject() {
  const store = useProjectStore();

  const initialCreateProjectInput: ICreateProjectInput = {
    coopname: '',
    parent_hash: '',
    title: '',
    description: '',
    can_convert_to_project: false,
    meta: '',
    project_hash: '',
    data: '',
    invite: '',
  };

  const createProjectInput = ref<ICreateProjectInput>({
    ...initialCreateProjectInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateProjectInput>,
    initial: ICreateProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createProject(
    data: ICreateProjectInput,
  ): Promise<ICreateProjectOutput> {
    const transaction = await api.createProject(data);

    // Получаем данные только что созданного проекта
    await store.loadProject({
      hash: data.project_hash,
    });
    console.log('store.project', store.project, data);
    // Добавляем проект в начало списка без перезагрузки всего списка
    if (store.project) {
      store.addProjectToList(store.project);
    }

    // Сбрасываем createProjectInput после выполнения createProject
    resetInput(createProjectInput, initialCreateProjectInput);

    return transaction;
  }

  return { createProject, createProjectInput };
}
