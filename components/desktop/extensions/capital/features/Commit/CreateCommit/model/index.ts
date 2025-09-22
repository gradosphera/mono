import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import {
  useCommitStore,
  type ICreateCommitOutput,
} from 'app/extensions/capital/entities/Commit/model';

export type ICreateCommitInput = Mutations.Capital.CreateCommit.IInput['data'];

export function useCreateCommit(projectHash?: string, username?: string) {
  const store = useCommitStore();

  const initialCreateCommitInput: ICreateCommitInput = {
    commit_hash: '',
    coopname: '',
    commit_hours: 0,
    description: '',
    meta: '',
    project_hash: projectHash || '',
    username: username || '',
  };

  const createCommitInput = ref<ICreateCommitInput>({
    ...initialCreateCommitInput,
  });

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<ICreateCommitInput>,
    initial: ICreateCommitInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function createCommit(
    data: ICreateCommitInput,
  ): Promise<ICreateCommitOutput> {
    const transaction = await api.createCommit(data);

    // Обновляем список коммитов после создания
    await store.loadCommits({});

    // Сбрасываем createCommitInput после выполнения createCommit
    resetInput(createCommitInput, initialCreateCommitInput);

    return transaction;
  }

  return { createCommit, createCommitInput };
}
