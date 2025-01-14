import { TransactResult } from '@wharfkit/session';
import { IModerateRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { MarketContract } from 'cooptypes';

async function moderateRequest(
  params: IModerateRequest
): Promise<TransactResult | undefined> {
  const result = await transact({
    actions: [
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.ModerateRequest.actionName,
        authorization: [
          {
            actor: params.username,
            permission: 'active',
          },
        ],
        data: {
          username: params.username,
          coopname: params.coopname,
          exchange_id: params.request_id,
          cancellation_fee: params.cancellation_fee,
        } as MarketContract.Actions.ModerateRequest.IModerateRequest,
      },
    ],
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  });

  return result;
}

export const api = {
  moderateRequest,
};
