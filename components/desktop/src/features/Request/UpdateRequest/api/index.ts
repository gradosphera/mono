import { TransactResult } from '@wharfkit/session';
import { IUpdateRequestData } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';

async function updateRequestData(
  params: IUpdateRequestData
): Promise<TransactResult | undefined> {
  const result = await transact({
    actions: [
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.UpdateRequests.actionName,
        authorization: [
          {
            actor: params.username,
            permission: 'active',
          },
        ],
        data: {
          coopname: params.coopname,
          username: params.username,
          exchange_id: params.requestId,
          remain_units: params.remainUnits,
          unit_cost: params.unitCost,
          data: JSON.stringify(params.data),
          meta: '',
        } as MarketContract.Actions.UpdateRequests.IUpdateRequest,
      },
    ],
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.requestId,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  updateRequestData,
};
