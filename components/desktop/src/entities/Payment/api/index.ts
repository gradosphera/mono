import type { IGetCoopOrders, IGetResponse, IOrderResponse } from '@coopenomics/controller'
import { sendGET } from 'src/shared/api'

const loadCoopPayments = async(params: IGetCoopOrders): Promise<IGetResponse<IOrderResponse>> => {
  console.log('params: ', params)
  return await sendGET('/v1/orders/all', params) as IGetResponse<IOrderResponse>
}

const loadMyPayments = async(username?: string, page?: number, limit?: number): Promise<IGetResponse<IOrderResponse>> => {
  return await sendGET(`/v1/orders/${username}`, {page, limit}) as IGetResponse<IOrderResponse>
}


export const api = {loadCoopPayments, loadMyPayments}
