import { TransactResult } from '@wharfkit/session';
import { IRecieveOnRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { IDocument } from 'src/shared/lib/types/document';
import { MarketContract } from 'cooptypes';

async function recieve(
  params: IRecieveOnRequest
): Promise<TransactResult | undefined> {
  //TODO здесь нужно получить подписанный документ (заявление на взнос имуществом) и подставить
  const document = {
    hash: '',
    public_key: '',
    signature: '',
    meta: '',
  } as IDocument;

  const result = await transact({
    actions: [
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.RecieveOnRequest.actionName,
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
          document,
        } as MarketContract.Actions.RecieveOnRequest.IRecieveOnRequest,
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
  recieve,
};
