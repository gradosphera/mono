import { client } from 'src/shared/api/client';
import { installExtension as installExtensionSelector, type IInstallExtensionInput } from '@coopenomics/coopjs/mutations/installExtension'
import type { IExtension } from '@coopenomics/coopjs/queries/getExtensions';
import { useExtensionStore } from 'src/entities/Extension/model';

export function useInstallExtension() {
  async function installExtension(
    name: string, enabled: boolean, config: any
  ): Promise<IExtension> {

    const data: IInstallExtensionInput = {
      name,
      enabled,
      config
    }

    const {installExtension: result} = await client.Mutation(installExtensionSelector, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { installExtension };
}
