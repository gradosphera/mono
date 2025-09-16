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
  projects: Ref<IProjectsPagination | null>;
  loadProjects: (data: IGetProjectsInput) => Promise<void>;
  addProjectToList: (projectData: IProject) => void;
  project: Ref<IGetProjectOutput | null>;
  loadProject: (data: IGetProjectInput) => Promise<void>;
  projectWithRelations: Ref<IProjectWithRelations | null>;
  loadProjectWithRelations: (
    data: IGetProjectWithRelationsInput,
  ) => Promise<void>;
}

export const useProjectStore = defineStore(namespace, (): IProjectStore => {
  const projects = ref<IProjectsPagination | null>(null);
  const project = ref<IGetProjectOutput | null>(null);
  const projectWithRelations = ref<IProjectWithRelations | null>(null);

  const loadProjects = async (data: IGetProjectsInput) => {
    const loadedData = await api.loadProjects(data);
    projects.value = loadedData;
  };

  const addProjectToList = (projectData: IProject) => {
    if (projects.value) {
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
    }
  };

  const loadProject = async (data: IGetProjectInput) => {
    const loadedData = await api.loadProject(data);
    project.value = loadedData;
  };

  const loadProjectWithRelations = async (
    data: IGetProjectWithRelationsInput,
  ) => {
    const loadedData = await api.loadProjectWithRelations(data);
    projectWithRelations.value = loadedData;
  };

  return {
    projects,
    project,
    projectWithRelations,
    loadProjects,
    addProjectToList,
    loadProject,
    loadProjectWithRelations,
  };
});
