import type { ICreatedPayment } from '../lib/types/payments';
import { sendPOST } from './axios';

export async function createInitialPaymentOrder(
  provider: string
): Promise<ICreatedPayment> {
  const response = await sendPOST('/v1/orders/initial', {provider});
  return response;
}
