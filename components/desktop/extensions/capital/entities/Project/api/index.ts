import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IProject,
  IProjectsPagination,
  IProjectWithRelations,
  IGetProjectInput,
  IGetProjectsInput,
  IGetProjectWithRelationsInput,
} from '../model';

async function loadProjects(
  data: IGetProjectsInput,
): Promise<IProjectsPagination> {
  const { [Queries.Capital.GetProjects.name]: output } = await client.Query(
    Queries.Capital.GetProjects.query,
    {
      variables: data,
    },
  );
  return output;
}

async function loadProject(data: IGetProjectInput): Promise<IProject> {
  const { [Queries.Capital.GetProject.name]: output } = await client.Query(
    Queries.Capital.GetProject.query,
    {
      variables: {
        data,
      },
    },
  );
  return output;
}

async function loadProjectWithRelations(
  data: IGetProjectWithRelationsInput,
): Promise<IProjectWithRelations> {
  const { [Queries.Capital.GetProjectWithRelations.name]: output } =
    await client.Query(Queries.Capital.GetProjectWithRelations.query, {
      variables: {
        data,
      },
    });
  return output;
}

export const api = {
  loadProjects,
  loadProject,
  loadProjectWithRelations,
};
