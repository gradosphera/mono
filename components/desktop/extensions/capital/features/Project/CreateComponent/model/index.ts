import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

export type ICreateComponentInput =
  Mutations.Capital.CreateProject.IInput['data'];

export type ICreateComponentOutput =
  Mutations.Capital.CreateProject.IOutput[typeof Mutations.Capital.CreateProject.name];

export function useCreateComponent() {
  const store = useProjectStore();

  const initialCreateComponentInput: ICreateComponentInput = {
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

  const createComponentInput = ref<ICreateComponentInput>({
    ...initialCreateComponentInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateComponentInput>,
    initial: ICreateComponentInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createComponent(
    data: ICreateComponentInput,
  ): Promise<ICreateComponentOutput> {
    const transaction = await api.createComponent(data);

    // Получаем данные родительского проекта
    await store.loadProject({
      hash: data.parent_hash,
    });

    // Добавляем проект в начало списка без перезагрузки всего списка
    if (store.project) {
      store.addProjectToList(store.project);
    }

    // Сбрасываем createComponentInput после выполнения createComponent
    resetInput(createComponentInput, initialCreateComponentInput);

    return transaction;
  }

  return { createComponent, createComponentInput };
}
