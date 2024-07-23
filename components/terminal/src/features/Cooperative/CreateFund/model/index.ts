import { TransactResult } from '@wharfkit/session';
import { FundContract} from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useCreateFund() {
  async function createFund(
    data: FundContract.Actions.CreateFund.ICreateFund
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: FundContract.contractName.production,
      name: FundContract.Actions.CreateFund.actionName,
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
  return { createFund };
}
