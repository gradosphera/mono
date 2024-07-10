import { TransactResult } from '@wharfkit/session';
import { IDisputeOnRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';
import { IDocument } from 'src/shared/lib/types/document';

async function dispute(
  params: IDisputeOnRequest
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
          document,
        } as MarketContract.Actions.OpenDispute.IOpenDispute,
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
  dispute,
};
