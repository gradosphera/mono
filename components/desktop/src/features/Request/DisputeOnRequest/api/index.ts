import { TransactResult } from '@wharfkit/session';
import { IDisputeOnRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';
import { fakeDocument } from 'src/shared/lib/document/model/const';

async function disputeOnRequest(
  params: IDisputeOnRequest
): Promise<TransactResult | undefined> {
  //TODO здесь нужно получить подписанный документ спора и подставить
  const document = fakeDocument;

  const result = await transact({
      account: ContractsList.Marketplace,
      name: MarketContract.Actions.OpenDispute.actionName,
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
      } as MarketContract.Actions.OpenDispute.IOpenDispute,
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  disputeOnRequest,
};
