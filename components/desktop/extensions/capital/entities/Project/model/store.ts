import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IGetProjectOutput,
  IProjectsPagination,
  IProjectWithRelations,
  IProject,
  IGetProjectInput,
  IGetProjectsInput,
  IGetProjectWithRelationsInput,
} from './types';

const namespace = 'projectStore';

interface IProjectStore {
  projects: Ref<IProjectsPagination>;
  loadProjects: (data: IGetProjectsInput) => Promise<IProjectsPagination>;
  addProjectToList: (projectData: IProject) => void;
  loadProject: (data: IGetProjectInput) => Promise<IGetProjectOutput>;
  projectWithRelations: Ref<IProjectWithRelations | null>;
  loadProjectWithRelations: (
    data: IGetProjectWithRelationsInput,
  ) => Promise<IProjectWithRelations>;
  isMaster: (project_hash: string, username: string) => Promise<boolean>;
}

export const useProjectStore = defineStore(namespace, (): IProjectStore => {
  const projects = ref<IProjectsPagination>({
    items: [],
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const projectWithRelations = ref<IProjectWithRelations | null>(null);

  const loadProjects = async (data: IGetProjectsInput): Promise<IProjectsPagination> => {
    const loadedData = await api.loadProjects(data);
    projects.value = loadedData;

    return loadedData;
  };

  const addProjectToList = (projectData: IProject) => {
    // Ищем существующий проект по _id
    const existingIndex = projects.value.items.findIndex(
      (project) => project._id === projectData._id,
    );

    if (existingIndex !== -1) {
      // Заменяем существующий проект
      projects.value.items[existingIndex] = projectData;
    } else {
      // Добавляем новый проект в начало списка
      projects.value.items = [
        projectData as IProject,
        ...projects.value.items,
      ];
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
      // Заменяем существующий проект
      projects.value.items[existingIndex] = loadedData as IProject;
    } else {
      // Добавляем новый проект в начало списка
      projects.value.items = [
        loadedData as IProject,
        ...projects.value.items,
      ];
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

  return {
    projects,
    projectWithRelations,
    loadProjects,
    addProjectToList,
    loadProject,
    loadProjectWithRelations,
    isMaster,
  };
});
