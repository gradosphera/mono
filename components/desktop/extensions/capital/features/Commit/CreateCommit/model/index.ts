import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { type ICreateCommitOutput } from 'app/extensions/capital/entities/Commit/model';
import { useTimeStatsStore } from 'app/extensions/capital/entities/TimeStats/model';
import { useSystemStore } from 'src/entities/System/model';

export type ICreateCommitInput = Mutations.Capital.CreateCommit.IInput['data'];

export function useCreateCommit(projectHash?: string, username?: string) {
  const timeStatsStore = useTimeStatsStore();
  const { info } = useSystemStore();

  const initialCreateCommitInput: ICreateCommitInput = {
    coopname: '',
    commit_hours: 0,
    description: '',
    meta: '',
    project_hash: projectHash || '',
    username: username || '',
    data: undefined, // Опционально - Git URL
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

    // Обновляем статистику времени для проекта после создания коммита
    await timeStatsStore.loadTimeStat({
      username: data.username,
      project_hash: data.project_hash,
      coopname: data.coopname || info.coopname,
    });

    // Сбрасываем createCommitInput после выполнения createCommit
    resetInput(createCommitInput, initialCreateCommitInput);

    return transaction;
  }

  return { createCommit, createCommitInput };
}
