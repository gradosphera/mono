import type { Queries, Mutations, Zeus } from '@coopenomics/sdk';

// Тип проекта-компонента (без вложенных компонентов)
export type IProjectComponent = Zeus.ModelTypes['CapitalProjectComponent'];

// Тип полного проекта (с компонентами)
export type IProject = Zeus.ModelTypes['CapitalProject'];

// Тип разрешений для проекта
export type IProjectPermissions = Zeus.ModelTypes['CapitalProjectPermissions'];

export type IGetProjectOutput =
  Queries.Capital.GetProject.IOutput[typeof Queries.Capital.GetProject.name];

export type IProjectsPagination =
  Queries.Capital.GetProjects.IOutput[typeof Queries.Capital.GetProjects.name];
export type IProjectWithRelations =
  Queries.Capital.GetProjectWithRelations.IOutput[typeof Queries.Capital.GetProjectWithRelations.name];

export type IGetProjectInput = Queries.Capital.GetProject.IInput['data'];
export type IGetProjectsInput = Queries.Capital.GetProjects.IInput;
export type IGetProjectWithRelationsInput =
  Queries.Capital.GetProjectWithRelations.IInput['data'];
export type ICreateProjectInput =
  Mutations.Capital.CreateProject.IInput['data'];
export type ICreateProjectOutput =
  Mutations.Capital.CreateProject.IOutput[typeof Mutations.Capital.CreateProject.name];
