import { TransactResult } from '@wharfkit/session';
import { FundContract} from 'cooptypes';
import { useSessionStore } from 'src/entities/Session';
import { useGlobalStore } from 'src/shared/store';

export function useEditFund() {
  async function editFund(
    data: FundContract.Actions.EditFund.IEditFund
  ): Promise<TransactResult | undefined> {
    const session = useSessionStore();

    const result = useGlobalStore().transact({
      account: FundContract.contractName.production,
      name: FundContract.Actions.EditFund.actionName,
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
  return { editFund };
}
