import { TransactResult } from '@wharfkit/session';
import { FundContract} from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useDeleteFund() {
  async function deleteFund(
    data: FundContract.Actions.DeleteFund.IDeleteFund
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: FundContract.contractName.production,
      name: FundContract.Actions.DeleteFund.actionName,
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
  return { deleteFund };
}
