import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations, type ModelTypes } from '@coopenomics/coopjs';

export function useUninstallExtension() {
  async function uninstallExtension(
    name: string
  ): Promise<boolean> {

    const data: ModelTypes['UninstallExtensionInput'] = {
      name,
    }

    const {uninstallExtension: result} = await client.Mutation(Mutations.uninstallExtension, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { uninstallExtension };
}
