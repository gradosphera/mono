import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type ISetMasterInput = Mutations.Capital.SetMaster.IInput['data'];
export type ISetMasterOutput =
  Mutations.Capital.SetMaster.IOutput[typeof Mutations.Capital.SetMaster.name];

async function setMaster(data: ISetMasterInput): Promise<ISetMasterOutput> {
  const { [Mutations.Capital.SetMaster.name]: result } = await client.Mutation(
    Mutations.Capital.SetMaster.mutation,
    {
      variables: {
        data,
      },
    },
  );

  return result;
}

export const api = {
  setMaster,
};
