import type { IGetCoopOrders, IGetResponse, IOrderResponse } from 'coopback'
import { sendGET } from 'src/shared/api'

const loadCoopOrders = async(params: IGetCoopOrders): Promise<IGetResponse<IOrderResponse>> => {
  console.log('params: ', params)
  return await sendGET('/v1/orders/all', params) as IGetResponse<IOrderResponse>
}

const loadMyOrders = async(username?: string, page?: number, limit?: number): Promise<IGetResponse<IOrderResponse>> => {
  return await sendGET(`/v1/orders/${username}`, {page, limit}) as IGetResponse<IOrderResponse>
}


export const api = {loadCoopOrders, loadMyOrders}
