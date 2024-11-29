import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations, type ModelTypes } from '@coopenomics/coopjs'

export function useInstallExtension() {
  async function installExtension(
    name: string, enabled: boolean, config: any
  ): Promise<ModelTypes['Extension']> {

    const data: Mutations.IInstallExtensionInput = {
      name,
      enabled,
      config
    }

    const {installExtension: result} = await client.Mutation(Mutations.installExtension, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { installExtension };
}
