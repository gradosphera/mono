import { TransactResult } from '@wharfkit/session';
import { IAcceptRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'app/extensions/market/entities/Request/model/stores';
import { IUpdateOneRequest } from 'app/extensions/market/entities/Request';
import { MarketContract } from 'cooptypes';
import { fakeDocument } from 'src/shared/lib/document/model/const';

async function acceptRequest(
  params: IAcceptRequest
): Promise<TransactResult | undefined> {
  //TODO здесь нужно получить подписанный документ (заявление на взнос имуществом) и подставить
  //сейчас установлены фейковые данные
  const document = fakeDocument

  //TODO: УБРАТЬ UNKNOWN БЛИЖЕ К РЕЛИЗУ - ЗДЕСЬ ЭТО ВРЕМЕННЫЙ БАГФИКС ЧТОБ СКРЫТЬ ОШИБКИ
  const result = await transact({
      account: ContractsList.Marketplace,
      name: MarketContract.Actions.AcceptRequest.actionName,
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
      } as unknown as MarketContract.Actions.AcceptRequest.IAcceptRequest,
  });

  const requestsStore = useRequestStore();
  requestsStore.updateOneRequest({
    coopname: params.coopname,
    request_id: params.request_id,
  } as IUpdateOneRequest);

  return result;
}

export const api = {
  acceptRequest,
};
