import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IUpdateSettingsInput = Mutations.System.UpdateSettings.IInput['data'];
export type IUpdateSettingsOutput = Mutations.System.UpdateSettings.IOutput[typeof Mutations.System.UpdateSettings.name];

async function updateSettings(
  data: IUpdateSettingsInput,
): Promise<IUpdateSettingsOutput> {
  const { [Mutations.System.UpdateSettings.name]: result } =
    await client.Mutation(Mutations.System.UpdateSettings.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  updateSettings,
};
