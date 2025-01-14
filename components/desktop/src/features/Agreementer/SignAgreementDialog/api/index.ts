import { TransactResult } from '@wharfkit/session';
import { transact } from 'src/shared/api';
import { SovietContract } from 'cooptypes';

async function sendAgreement(
  data: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement
): Promise<TransactResult | undefined> {

  return await transact(
    {
      account: SovietContract.contractName.production,
      name: SovietContract.Actions.Agreements.SendAgreement.actionName,
      authorization: [
        {
          actor: data.username,
          permission: 'active',
        },
      ],
      data
    },
   );
}

export const api = {
  sendAgreement,
}
