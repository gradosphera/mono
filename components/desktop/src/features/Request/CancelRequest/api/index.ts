import { TransactResult } from '@wharfkit/session';
import { ICancelRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';

async function cancelRequest(
  params: ICancelRequest
): Promise<TransactResult | undefined> {
  const result = await transact({
    actions: [
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.CancelRequest.actionName,
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
        } as MarketContract.Actions.CancelRequest.ICancelRequest,
      },
    ],
  });

  const requestsStore = useRequestStore();

  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  cancelRequest,
};
