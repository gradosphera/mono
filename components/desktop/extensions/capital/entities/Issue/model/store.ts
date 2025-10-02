import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type { IIssuesPagination, IGetIssuesInput, IIssue } from './types';

const namespace = 'issueStore';

interface IIssueStore {
  issuesByProject: Ref<Record<string, IIssuesPagination>>;
  loadIssues: (data: IGetIssuesInput, projectHash: string) => Promise<void>;
  addIssue: (projectHash: string, issueData: IIssue) => void;
  removeIssue: (projectHash: string, issueHash: string) => void;
  getProjectIssues: (projectHash: string) => IIssuesPagination | null;
}

export const useIssueStore = defineStore(namespace, (): IIssueStore => {
  const issuesByProject = ref<Record<string, IIssuesPagination>>({});

  const loadIssues = async (data: IGetIssuesInput, projectHash: string): Promise<void> => {
    const loadedData = await api.loadIssues(data);
    issuesByProject.value[projectHash] = loadedData;
  };

  const addIssue = (projectHash: string, issueData: IIssue) => {
    const projectIssues = issuesByProject.value[projectHash];
    if (!projectIssues) {
      // Если для проекта еще нет данных, инициализируем пустой массив
      issuesByProject.value[projectHash] = {
        items: [issueData],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      };
      return;
    }

    // Ищем существующую задачу по _id
    const existingIndex = projectIssues.items.findIndex(
      (issue) => issue._id === issueData._id,
    );

    if (existingIndex !== -1) {
      // Заменяем существующую задачу
      projectIssues.items[existingIndex] = issueData;
    } else {
      // Добавляем новую задачу в начало списка
      projectIssues.items = [issueData, ...projectIssues.items];
      // Увеличиваем общее количество
      projectIssues.totalCount += 1;
    }
  };

  const removeIssue = (projectHash: string, issueHash: string) => {
    const projectIssues = issuesByProject.value[projectHash];
    if (!projectIssues) return;

    // Ищем задачу по issue_hash
    const issueIndex = projectIssues.items.findIndex(
      (issue) => issue.issue_hash === issueHash,
    );

    if (issueIndex !== -1) {
      // Удаляем задачу из списка
      projectIssues.items.splice(issueIndex, 1);
      // Уменьшаем общее количество
      projectIssues.totalCount -= 1;
    }
  };

  const getProjectIssues = (projectHash: string): IIssuesPagination | null => {
    return issuesByProject.value[projectHash] || null;
  };

  return {
    issuesByProject,
    loadIssues,
    addIssue,
    removeIssue,
    getProjectIssues,
  };
});
