import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IConfirmApprovalInput = Mutations.Chairman.ConfirmApprove.IInput['data'];
export type IConfirmApprovalOutput = Mutations.Chairman.ConfirmApprove.IOutput[typeof Mutations.Chairman.ConfirmApprove.name];

async function confirmApproval(
  data: IConfirmApprovalInput,
): Promise<IConfirmApprovalOutput> {
  const { [Mutations.Chairman.ConfirmApprove.name]: result } =
    await client.Mutation(Mutations.Chairman.ConfirmApprove.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  confirmApproval,
};
