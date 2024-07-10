import { TransactResult } from '@wharfkit/session';
import { ICreateChildOrder } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IDocument } from 'src/shared/lib/types/document';
import { MarketContract } from 'cooptypes';

async function createChildOrder(
  params: ICreateChildOrder
): Promise<TransactResult | undefined> {
  //TODO здесь передаём пустой документ
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
        name: MarketContract.Actions.CreateOrder.actionName,
        authorization: [
          {
            actor: params.username,
            permission: 'active',
          },
        ],
        data: {
          params: {
            username: params.username,
            coopname: params.coopname,
            parent_id: params.parent_id,
            program_id: params.program_id,
            pieces: params.pieces,
            unit_cost: params.unit_cost,
            product_lifecycle_secs: 0,
            document,
            data: '',
            meta: '',
          },
        } as MarketContract.Actions.CreateOrder.ICreateOrder,
      },
    ],
  });

  const requestsStore = useRequestStore();
  requestsStore.loadUserChildOrders({
    coopname: params.coopname,
    username: params.username,
  });

  return result;
}

export const api = {
  createChildOrder,
};
