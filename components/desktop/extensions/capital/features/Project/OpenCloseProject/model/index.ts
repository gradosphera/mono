import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';

// Типы для входных данных
export type IOpenProjectInput = Mutations.Capital.OpenProject.IInput['data'];
export type ICloseProjectInput = Mutations.Capital.CloseProject.IInput['data'];

export function useOpenCloseProject() {
  const store = useProjectStore();

  // Функция для открытия проекта
  async function openProject(data: IOpenProjectInput) {
    const updatedProject = await api.openProject(data);

    // Обновляем проект в store после открытия
    store.addProjectToList(updatedProject);

    return updatedProject;
  }

  // Функция для закрытия проекта
  async function closeProject(data: ICloseProjectInput) {
    const updatedProject = await api.closeProject(data);

    // Обновляем проект в store после закрытия
    store.addProjectToList(updatedProject);

    return updatedProject;
  }

  return {
    openProject,
    closeProject,
  };
}
