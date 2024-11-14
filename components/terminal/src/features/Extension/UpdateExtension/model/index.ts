import { client } from 'src/shared/api/client';
import { updateExtension as updateExtensionSelector, IUpdateExtensionInput } from '@coopenomics/coopjs/mutations/updateExtension'
import type { IExtension } from '@coopenomics/coopjs/queries/getExtensions';
import { useExtensionStore } from 'src/entities/Extension/model';

export function useUpdateExtension() {
  async function updateExtension(
    name: string, enabled: boolean, config: any
  ): Promise<IExtension> {

    const data: IUpdateExtensionInput = {
      name: name,
      config,
      enabled,
    }
    console.log('data: ', data)
    const {updateExtension: result} = await client.Mutation(updateExtensionSelector, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { updateExtension };
}
