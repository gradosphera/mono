import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';

export type IDeclineApprovalInput = Mutations.Chairman.DeclineApprove.IInput['data'];
export type IDeclineApprovalOutput = Mutations.Chairman.DeclineApprove.IOutput[typeof Mutations.Chairman.DeclineApprove.name];

async function declineApproval(
  data: IDeclineApprovalInput,
): Promise<IDeclineApprovalOutput> {
  const { [Mutations.Chairman.DeclineApprove.name]: result } =
    await client.Mutation(Mutations.Chairman.DeclineApprove.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  declineApproval,
};
