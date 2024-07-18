import { TransactResult } from '@wharfkit/session';
import { RegistratorContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useUpdateCoop() {
  async function updateCoop(
    data: RegistratorContract.Actions.UpdateCoop.IUpdateCoop
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.UpdateCoop.actionName,
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
  return { updateCoop };
}
