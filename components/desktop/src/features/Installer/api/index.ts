import { client } from 'src/shared/api/client';
import { Mutations, Queries } from '@coopenomics/sdk';
import type { IInitSystemInput } from '../model';

async function install(data: Mutations.System.InstallSystem.IInput['data']): Promise<Mutations.System.InstallSystem.IOutput[typeof Mutations.System.InstallSystem.name]> {
  const { [Mutations.System.InstallSystem.name]: result } = await client.Mutation(
    Mutations.System.InstallSystem.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

async function startInstall(data: Mutations.System.StartInstall.IInput['data']): Promise<Mutations.System.StartInstall.IOutput[typeof Mutations.System.StartInstall.name]> {
  const { [Mutations.System.StartInstall.name]: result } = await client.Mutation(
    Mutations.System.StartInstall.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

async function initSystem(data: IInitSystemInput): Promise<Mutations.System.InitSystem.IOutput[typeof Mutations.System.InitSystem.name]> {
  const { [Mutations.System.InitSystem.name]: result } = await client.Mutation(
    Mutations.System.InitSystem.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

async function getInstallationStatus(data: Queries.System.GetInstallationStatus.IInput['data']): Promise<Queries.System.GetInstallationStatus.IOutput[typeof Queries.System.GetInstallationStatus.name]> {
  const { [Queries.System.GetInstallationStatus.name]: result } = await client.Query(
    Queries.System.GetInstallationStatus.query,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

export const api = {
  install,
  startInstall,
  initSystem,
  getInstallationStatus
}
