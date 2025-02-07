import { Mutations } from '@coopenomics/sdk';
import { useRequestStore } from 'src/entities/Request/model/stores';
import { api } from '../api';
import { client } from 'src/shared/api/client';

export * from './types'

export function useCreateChildOrder() {
  async function createChildOrder(
    //TODO перевести id на хэши
    data: Mutations.Cooplace.GenerateReturnByAssetStatement.IInput['data'] & {parent_id: number}
  ): Promise<Mutations.Cooplace.CreateChildOrder.IOutput[typeof Mutations.Cooplace.CreateChildOrder.name]> {

    const returnByAssetStatement = await api.generateReturnByAssetStatement({
      coopname: data.coopname,
      username: data.username,
      request: data.request,
    })

    const document = await client.Document.signDocument(returnByAssetStatement)

      //TODO здесь же нужно передать распоряжение на использование средств цифрового кошелька

    const result = await api.createChildOrder({
      coopname: data.coopname,
      data: '',
      meta: '',
      parent_id: data.parent_id,
      product_lifecycle_secs: 0,
      program_id: data.request.program_id,
      unit_cost: data.request.unit_cost,
      units: data.request.units,
      username: data.username,
      document
    })

    const requestsStore = useRequestStore();
    requestsStore.loadUserChildOrders({
      coopname: data.coopname,
      username: data.username,
    });


    return result;
  }
  return { createChildOrder };
}
