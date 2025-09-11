import type { Queries, Mutations } from '@coopenomics/sdk';

export type IProject =
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
