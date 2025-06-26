import { api } from '../api';
import type { ICreateDeposit } from 'src/entities/Wallet/model/types';
import type { IPaymentOrder } from 'src/shared/lib/types/payments';

export function useCreateDepositPayment() {
  async function createDeposit(data: ICreateDeposit): Promise<IPaymentOrder> {
    return await api.createDepositPayment(data);
  }

  return {
    createDeposit,
  };
}
