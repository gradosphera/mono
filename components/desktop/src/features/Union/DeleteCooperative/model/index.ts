import { TransactResult } from '@wharfkit/session';
import { RegistratorContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useDeleteCooperative() {
  async function deleteCooperative(
    coopname: string,
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const data: RegistratorContract.Actions.DeleteCooperative.IDeleteCooperative = {
      coopname,
      registrator: session.username
    }

    const result = useGlobalStore().transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.DeleteCooperative.actionName,
      authorization: [
        {
          actor: session.username,
          permission: 'active',
        },
      ],
      data,
    });

    return result;
  }
  return { deleteCooperative };
}
