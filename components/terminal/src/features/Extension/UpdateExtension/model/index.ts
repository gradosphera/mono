import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations, type ModelTypes } from '@coopenomics/coopjs';

export function useUpdateExtension() {
  async function updateExtension(
    name: string, enabled: boolean, config: any
  ): Promise<ModelTypes['Extension']> {

    const data: Partial<ModelTypes['Extension']> = {
      name: name,
      config,
      enabled,
    }

    const {updateExtension: result} = await client.Mutation(Mutations.updateExtension, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { updateExtension };
}
