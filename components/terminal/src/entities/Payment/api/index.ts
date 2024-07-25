import { sendGET, sendPOST } from 'src/shared/api';
import { IAddPaymentMethod, IDeletePaymentMethod, IGetPaymentMethods, IPaymentData } from '../model';

async function loadMethods(params: IGetPaymentMethods): Promise<IPaymentData> {
  const {username} = params
  const methods = (await sendGET('/v1/payments/methods', {username})) as IPaymentData;
  return methods;
}

async function addMethod(params: IAddPaymentMethod): Promise<void> {
  await sendPOST(`/v1/payments/methods/${params.username}/add`, params)
}

async function deleteMethod(params: IDeletePaymentMethod): Promise<void>{
  const {username, method_id} = params

  await sendPOST(`/v1/payments/methods/${username}/delete`, {method_id})
}

export const api = {
  loadMethods,
  addMethod,
  deleteMethod
}
