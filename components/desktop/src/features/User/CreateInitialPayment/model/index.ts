import { api } from '../api';
import type { ICreateInitialPayment } from 'src/entities/Wallet/model/types';
import type { IInitialPaymentOrder } from 'src/shared/lib/types/payments';

export function useCreateInitialPayment() {
  async function createInitialPayment(
    data: ICreateInitialPayment,
  ): Promise<IInitialPaymentOrder> {
    return await api.createInitialPayment(data);
  }

  return {
    createInitialPayment,
  };
}
