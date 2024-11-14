import { client } from 'src/shared/api/client';
import { uninstallExtension as uninstallExtensionSelector, type IUninstallExtensionInput } from '@coopenomics/coopjs/mutations/uninstallExtension'
import { useExtensionStore } from 'src/entities/Extension/model';

export function useUninstallExtension() {
  async function uninstallExtension(
    name: string
  ): Promise<boolean> {

    const data: IUninstallExtensionInput = {
      name,
    }

    const {uninstallExtension: result} = await client.Mutation(uninstallExtensionSelector, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { uninstallExtension };
}
