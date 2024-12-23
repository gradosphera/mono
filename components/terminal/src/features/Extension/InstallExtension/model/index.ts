import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations } from '@coopenomics/coopjs'

export function useInstallExtension() {
  async function installExtension(
    name: string, enabled: boolean, config: any
  ): Promise<Mutations.Extensions.InstallExtension.IOutput[typeof Mutations.Extensions.InstallExtension.name]> {

    const data: Mutations.Extensions.InstallExtension.IInput = {
      name,
      enabled,
      config
    }

    const {installExtension: result} = await client.Mutation(Mutations.Extensions.InstallExtension.mutation, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { installExtension };
}
