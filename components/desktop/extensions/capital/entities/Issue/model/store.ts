import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IIssuesPagination, IGetIssuesInput, IIssue } from './types';

const namespace = 'issueStore';

interface IIssueStore {
  issues: Ref<IIssuesPagination | null>;
  loadIssues: (data: IGetIssuesInput) => Promise<void>;
  addIssueToList: (issueData: IIssue) => void;
  removeIssueFromList: (issueHash: string) => void;
}

export const useIssueStore = defineStore(namespace, (): IIssueStore => {
  const issues = ref<IIssuesPagination | null>(null);

  const loadIssues = async (data: IGetIssuesInput): Promise<void> => {
    const loadedData = await api.loadIssues(data);
    issues.value = loadedData;
  };

  const addIssueToList = (issueData: IIssue) => {
    if (issues.value) {
      // Ищем существующую задачу по _id
      const existingIndex = issues.value.items.findIndex(
        (issue) => issue._id === issueData._id,
      );

      if (existingIndex !== -1) {
        // Заменяем существующую задачу
        issues.value.items[existingIndex] = issueData;
      } else {
        // Добавляем новую задачу в начало списка
        issues.value.items = [issueData, ...issues.value.items];
        // Увеличиваем общее количество
        issues.value.totalCount += 1;
      }
    }
  };

  const removeIssueFromList = (issueHash: string) => {
    if (issues.value) {
      // Ищем задачу по issue_hash
      const issueIndex = issues.value.items.findIndex(
        (issue) => issue.issue_hash === issueHash,
      );

      if (issueIndex !== -1) {
        // Удаляем задачу из списка
        issues.value.items.splice(issueIndex, 1);
        // Уменьшаем общее количество
        issues.value.totalCount -= 1;
      }
    }
  };

  return {
    issues,
    loadIssues,
    addIssueToList,
    removeIssueFromList,
  };
});
