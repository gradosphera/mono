import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { ICommitsPagination, IGetCommitsInput } from './types';

const namespace = 'commitStore';

interface ICommitStore {
  commits: Ref<ICommitsPagination | null>;
  loadCommits: (data: IGetCommitsInput) => Promise<void>;
}

export const useCommitStore = defineStore(namespace, (): ICommitStore => {
  const commits = ref<ICommitsPagination | null>(null);

  const loadCommits = async (data: IGetCommitsInput): Promise<void> => {
    const loadedData = await api.loadCommits(data);
    commits.value = loadedData;
  };

  return {
    commits,
    loadCommits,
  };
});
