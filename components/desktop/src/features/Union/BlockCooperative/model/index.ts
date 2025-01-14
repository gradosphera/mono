import { TransactResult } from '@wharfkit/session';
import { RegistratorContract } from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useBlockCooperative() {
  async function blockCooperative(
    coopname: string,
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const data: RegistratorContract.Actions.SetCoopStatus.ISetCoopStatus = {
      coopname,
      username: session.username,
      status: 'blocked'
    }

    const result = useGlobalStore().transact({
      account: RegistratorContract.contractName.production,
      name: RegistratorContract.Actions.SetCoopStatus.actionName,
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
  return { blockCooperative };
}
