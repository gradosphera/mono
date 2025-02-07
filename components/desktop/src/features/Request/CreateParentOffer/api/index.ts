import { TransactResult } from '@wharfkit/session';
import { ICreateOffer } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { ILoadUserParentOffers } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';

async function createParentOffer(
  params: ICreateOffer
): Promise<TransactResult | undefined> {

  // здесь мы не передаём документ
  const result = await transact(
      {
        account: ContractsList.Marketplace,
        name: MarketContract.Actions.CreateOffer.actionName,
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
            parent_id: 0,
            program_id: params.program_id,
            units: params.units,
            unit_cost: params.unit_cost,
            product_lifecycle_secs: params.product_lifecycle_secs,
            // document,
            data: JSON.stringify(params.data),
            meta: '',
          },
        } as MarketContract.Actions.CreateOffer.ICreateOffer,
      });

  const requestsStore = useRequestStore();
  requestsStore.loadUserParentOffers({
    coopname: params.coopname,
    username: params.username,
  } as ILoadUserParentOffers);

  return result;
}

export const api = {
  createParentOffer,
};
