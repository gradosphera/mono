import { TransactResult } from '@wharfkit/session';
import { ISupplyOnRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';
import { fakeDocument } from 'src/shared/lib/document/model/const';

async function supplyOnRequest(
  params: ISupplyOnRequest
): Promise<TransactResult | undefined> {
  //TODO здесь нужно получить подписанный документ (накладная) и подставить
  const document = fakeDocument;

  const result = await transact({
      account: ContractsList.Marketplace,
      name: MarketContract.Actions.SupplyOnRequest.actionName,
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
        document: {...document, meta: JSON.stringify(document.meta)},
      } as MarketContract.Actions.SupplyOnRequest.ISupplyOnRequest,
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  supplyOnRequest,
};
