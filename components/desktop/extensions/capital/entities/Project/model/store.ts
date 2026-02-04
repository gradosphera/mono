import { defineStore } from 'pinia';
import { ref, Ref, computed } from 'vue';
import { api } from '../api';
import type {
  IGetProjectOutput,
  IProjectsPagination,
  IProjectWithRelations,
  IProject,
  IGetProjectInput,
  IGetProjectsInput,
  IGetProjectWithRelationsInput,
  IGetProjectLogsInput,
  IGetProjectLogsOutput,
} from './types';

const namespace = 'projectStore';

interface IProjectFilters {
  statuses: string[];
  priorities: string[];
  creators: string[];
  master?: string;
}

interface IProjectStore {
  projects: Ref<IProjectsPagination>;
  loadProjects: (data: IGetProjectsInput, append?: boolean) => Promise<IProjectsPagination>;
  addProjectToList: (projectData: IProject) => void;
  loadProject: (data: IGetProjectInput) => Promise<IGetProjectOutput>;
  projectWithRelations: Ref<IProjectWithRelations | null>;
  loadProjectWithRelations: (
    data: IGetProjectWithRelationsInput,
  ) => Promise<IProjectWithRelations>;
  loadProjectLogs: (data: IGetProjectLogsInput) => Promise<IGetProjectLogsOutput>;
  isMaster: (project_hash: string, username: string) => Promise<boolean>;
  // Фильтры проектов
  projectFilters: Ref<IProjectFilters>;
  setProjectFilters: (filters: IProjectFilters) => void;
  resetProjectFilters: () => void;
  hasActiveProjectFilters: Ref<boolean>;
}

export const useProjectStore = defineStore(namespace, (): IProjectStore => {
  const projects = ref<IProjectsPagination>({
    items: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const projectWithRelations = ref<IProjectWithRelations | null>(null);

  // Фильтры проектов
  const projectFilters = ref<IProjectFilters>({
    statuses: [],
    priorities: [],
    creators: [],
    master: undefined,
  });

  const loadProjects = async (data: IGetProjectsInput, append = false): Promise<IProjectsPagination> => {
    const loadedData = await api.loadProjects(data);

    if (append && projects.value.items.length > 0) {
      // Объединяем результаты с существующими данными
      projects.value = {
        ...loadedData,
        items: [...projects.value.items, ...loadedData.items],
      };
    } else {
      // Заменяем данные полностью
      projects.value = loadedData;
    }

    return projects.value;
  };

  const addProjectToList = (projectData: IProject) => {
    // Ищем существующий проект по _id
    const existingIndex = projects.value.items.findIndex(
      (project) => project._id === projectData._id,
    );

    if (existingIndex !== -1) {
      // Заменяем существующий проект с помощью splice для реактивности
      projects.value.items.splice(existingIndex, 1, projectData);
    } else {
      // Добавляем новый проект в начало списка
      projects.value.items.splice(0, 0, projectData as IProject);
      // Увеличиваем общее количество
      projects.value.totalCount += 1;
    }
  };

  const loadProject = async (data: IGetProjectInput): Promise<IGetProjectOutput> => {
    const loadedData = await api.loadProject(data);
    if (!loadedData) return;

    // Обновляем проект в списке projects
    const existingIndex = projects.value.items.findIndex(
      (project) => project.project_hash === loadedData.project_hash,
    );

    if (existingIndex !== -1) {
      // Заменяем существующий проект с помощью splice для реактивности
      projects.value.items.splice(existingIndex, 1, loadedData as IProject);
    } else {
      // Добавляем новый проект в начало списка
      projects.value.items.splice(0, 0, loadedData as IProject);
      // Увеличиваем общее количество
      projects.value.totalCount += 1;
    }

    return loadedData;
  };

  const loadProjectWithRelations = async (
    data: IGetProjectWithRelationsInput,
  ): Promise<IProjectWithRelations> => {
    const loadedData = await api.loadProjectWithRelations(data);
    projectWithRelations.value = loadedData;
    return loadedData;
  };

  const loadProjectLogs = async (data: IGetProjectLogsInput): Promise<IGetProjectLogsOutput> => {
    return await api.loadProjectLogs(data);
  };

  const isMaster = async (project_hash: string, username: string): Promise<boolean> => {
    // Ищем проект в локальном списке
    let project = projects.value.items.find(
      (project) => project.project_hash === project_hash,
    );

    // Если проект не найден, загружаем его
    if (!project) {
      const loadedProject = await loadProject({ hash: project_hash });
      if (!loadedProject) {
        return false;
      }
      project = loadedProject;
    }

    // Проверяем, является ли пользователь мастером
    return project.master === username;
  };

  // Методы для работы с фильтрами проектов
  const setProjectFilters = (filters: IProjectFilters) => {
    projectFilters.value = { ...filters };
  };

  const resetProjectFilters = () => {
    projectFilters.value = {
      statuses: [],
      priorities: [],
      creators: [],
      master: undefined,
    };
  };

  const hasActiveProjectFilters = computed(() => {
    return (
      projectFilters.value.statuses.length > 0 ||
      projectFilters.value.priorities.length > 0 ||
      projectFilters.value.creators.length > 0 ||
      !!projectFilters.value.master
    );
  });

  return {
    projects,
    projectWithRelations,
    loadProjects,
    addProjectToList,
    loadProject,
    loadProjectWithRelations,
    loadProjectLogs,
    isMaster,
    // Фильтры проектов
    projectFilters,
    setProjectFilters,
    resetProjectFilters,
    hasActiveProjectFilters,
  };
});
