import { TransactResult } from '@wharfkit/session';
import { IUnpublishRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';

async function unpublishRequest(
  params: IUnpublishRequest
): Promise<TransactResult | undefined> {
  const result = await transact({
      account: ContractsList.Marketplace,
      name: MarketContract.Actions.UnpublishRequest.actionName,
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
      } as MarketContract.Actions.UnpublishRequest.IUnpublishRequest,

  });

  const requestsStore = useRequestStore();

  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  unpublishRequest,
};
