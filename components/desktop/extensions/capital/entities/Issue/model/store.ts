import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IIssuesPagination, IGetIssuesInput } from './types';

const namespace = 'issueStore';

interface IIssueStore {
  issues: Ref<IIssuesPagination | null>;
  loadIssues: (data: IGetIssuesInput) => Promise<void>;
}

export const useIssueStore = defineStore(namespace, (): IIssueStore => {
  const issues = ref<IIssuesPagination | null>(null);

  const loadIssues = async (data: IGetIssuesInput): Promise<void> => {
    const loadedData = await api.loadIssues(data);
    issues.value = loadedData;
  };

  return {
    issues,
    loadIssues,
  };
});
