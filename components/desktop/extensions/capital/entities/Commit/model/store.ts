import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ICommitsPagination, IGetCommitsInput, ICommit } from './types';

const namespace = 'commitStore';

interface ICommitStore {
  commits: Ref<ICommitsPagination | null>;
  loadCommits: (data: IGetCommitsInput) => Promise<void>;
  updateCommitInList: (commitData: ICommit) => void;
}

export const useCommitStore = defineStore(namespace, (): ICommitStore => {
  const commits = ref<ICommitsPagination | null>(null);

  const loadCommits = async (data: IGetCommitsInput): Promise<void> => {
    const loadedData = await api.loadCommits(data);
    commits.value = loadedData;
  };

  const updateCommitInList = (commitData: ICommit) => {
    if (!commits.value) return;

    // Ищем существующий коммит по commit_hash
    const existingIndex = commits.value.items.findIndex(
      (commit) => commit.commit_hash === commitData.commit_hash,
    );

    if (existingIndex !== -1) {
      // Заменяем существующий коммит
      commits.value.items[existingIndex] = commitData;
    } else {
      // Добавляем новый коммит в начало списка
      commits.value.items = [
        commitData as ICommit,
        ...commits.value.items,
      ];
      // Увеличиваем общее количество
      commits.value.totalCount += 1;
    }
  };

  return {
    commits,
    loadCommits,
    updateCommitInList,
  };
});
