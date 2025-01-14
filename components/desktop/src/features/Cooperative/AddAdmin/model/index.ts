import { TransactResult } from '@wharfkit/session';
import { SovietContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useAddAdmin() {
  async function addAdmin(
    data: SovietContract.Actions.Admins.AddAdmin.IAddAdmin
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Admins.AddAdmin.actionName,
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
  return { addAdmin };
}
