import { ISupplyOnRequest } from '../model';
import { transact } from 'src/shared/api';
import { ContractsList } from 'src/shared/config';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { IUpdateOneRequest } from 'src/entities/Request';
import { MarketContract } from 'cooptypes';
import { IDocument } from 'src/shared/lib/types/document';
import { TransactResult } from '@wharfkit/session';

async function supplyOnRequest(
  params: ISupplyOnRequest
): Promise<TransactResult | undefined> {
  //TODO получить подписанный акт приёма-передачи имущества
  const document = {
    hash: '33CBC662E606F23F332B442BAB84F2D05BD498B66EF61BC918740606B05BD565',
    public_key: 'PUB_K1_8YWRWjCdUQubPoHzT5ndvfhGKDf1ZL7v7Ge9iHoLtNp7wnVfG1',
    signature: 'SIG_K1_KWeGQ48n78ybpkuVDf1M7nuGnT8pkPXFbYYMUXtFTFv2dEReMEmwW89r19dKmAVSFZwHTdxdqkB3ZQJeAS9CcQwb92E398',
    meta: '',
  } as IDocument;

  const result = await transact({
    actions: [
      {
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
          document,
        } as MarketContract.Actions.SupplyOnRequest.ISupplyOnRequest,
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
  supplyOnRequest,
};
