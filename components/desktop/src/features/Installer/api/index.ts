import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

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

export const api = {
  install
}
