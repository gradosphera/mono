import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

// Типы для открытия проекта
export type IOpenProjectInput = Mutations.Capital.OpenProject.IInput['data'];
export type IOpenProjectOutput =
  Mutations.Capital.OpenProject.IOutput[typeof Mutations.Capital.OpenProject.name];

// Типы для закрытия проекта
export type ICloseProjectInput = Mutations.Capital.CloseProject.IInput['data'];
export type ICloseProjectOutput =
  Mutations.Capital.CloseProject.IOutput[typeof Mutations.Capital.CloseProject.name];

async function openProject(
  data: IOpenProjectInput,
): Promise<IOpenProjectOutput> {
  const { [Mutations.Capital.OpenProject.name]: result } =
    await client.Mutation(Mutations.Capital.OpenProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

async function closeProject(
  data: ICloseProjectInput,
): Promise<ICloseProjectOutput> {
  const { [Mutations.Capital.CloseProject.name]: result } =
    await client.Mutation(Mutations.Capital.CloseProject.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  openProject,
  closeProject,
};
