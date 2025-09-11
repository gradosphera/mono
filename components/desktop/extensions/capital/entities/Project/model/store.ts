import { defineStore } from 'pinia';
import { ref, Ref } from 'vue';
import { api } from '../api';
import type {
  IProject,
  IProjectsPagination,
  IProjectWithRelations,
  IGetProjectInput,
  IGetProjectsInput,
  IGetProjectWithRelationsInput,
} from './types';

const namespace = 'projectStore';

interface IProjectStore {
  projects: Ref<IProjectsPagination | null>;
  loadProjects: (data: IGetProjectsInput) => Promise<void>;
  project: Ref<IProject | null>;
  loadProject: (data: IGetProjectInput) => Promise<void>;
  projectWithRelations: Ref<IProjectWithRelations | null>;
  loadProjectWithRelations: (
    data: IGetProjectWithRelationsInput,
  ) => Promise<void>;
}

export const useProjectStore = defineStore(namespace, (): IProjectStore => {
  const projects = ref<IProjectsPagination | null>(null);
  const project = ref<IProject | null>(null);
  const projectWithRelations = ref<IProjectWithRelations | null>(null);

  const loadProjects = async (data: IGetProjectsInput) => {
    const loadedData = await api.loadProjects(data);
    projects.value = loadedData;
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
    loadProject,
    loadProjectWithRelations,
  };
});
