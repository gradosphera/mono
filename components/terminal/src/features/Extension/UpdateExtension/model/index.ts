import { client } from 'src/shared/api/client';
import { useExtensionStore } from 'src/entities/Extension/model';
import { Mutations } from '@coopenomics/coopjs';

export function useUpdateExtension() {
  async function updateExtension(
    name: string, enabled: boolean, config: any
  ): Promise<Mutations.Extensions.UpdateExtension.IOutput[typeof Mutations.Extensions.UpdateExtension.name]> {

    const data: Partial<Mutations.Extensions.UpdateExtension.IInput> = {
      name: name,
      config,
      enabled,
    }

    const {[Mutations.Extensions.UpdateExtension.name]: result} = await client.Mutation(Mutations.Extensions.UpdateExtension.mutation, {variables: {
      data
    }})

    await useExtensionStore().loadExtensions()

    return result;
  }
  return { updateExtension };
}
