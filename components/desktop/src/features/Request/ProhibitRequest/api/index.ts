import { TransactResult } from '@wharfkit/session';
import { IProhibitRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { MarketContract } from 'cooptypes';

async function prohibitRequest(
  params: IProhibitRequest
): Promise<TransactResult | undefined> {
  const result = await transact({
      account: ContractsList.Marketplace,
      name: MarketContract.Actions.ProhibitRequest.actionName,
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
        meta: '',
      } as MarketContract.Actions.ProhibitRequest.IProhibitRequest,
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  });

  return result;
}

export const api = {
  prohibitRequest,
};
