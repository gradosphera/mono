import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations } from '@coopenomics/sdk';

export function useUninstallExtension() {
  async function uninstallExtension(
    name: string
  ): Promise<boolean> {

    const data: Mutations.Extensions.UninstallExtension.IInput['data'] = {
      name,
    }

    const {[Mutations.Extensions.UninstallExtension.name]: result} = await client.Mutation(Mutations.Extensions.UninstallExtension.mutation, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { uninstallExtension };
}
