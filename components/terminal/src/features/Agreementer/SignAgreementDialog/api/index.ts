import { TransactResult } from '@wharfkit/session';
import { transact } from 'src/shared/api';
import { MarketContract, SovietContract } from 'cooptypes';

async function sendAgreement(
  data: SovietContract.Actions.Agreements.SendAgreement.ISendAgreement
): Promise<TransactResult | undefined> {
  return await transact({
    actions: [
      {
        account: SovietContract.contractName.production,
        name: MarketContract.Actions.AcceptRequest.actionName,
        authorization: [
          {
            actor: data.username,
            permission: 'active',
          },
        ],
        data
      },
    ],
  });
}

export const api = {
  sendAgreement,
}
