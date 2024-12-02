import { api } from '../api';
import type { ModelTypes } from '@coopenomics/coopjs/index';
export interface IBankTransferData {
  account_number: string;
  bank_name: string;
  card_number?: string;
  currency: string;
  details: {
    bik: string;
    corr: string;
    kpp: string;
  };
}

export interface IUpdateBranchBankAccount {
  username: string;
  method_id: string;
  method_type: string;
  data: IBankTransferData;
}


export function useUpdateBranchBankAccount() {

  async function updateBankAccount(method: ModelTypes['BankPaymentMethod']) {

    const data: ModelTypes['UpdateBankAccountInput'] = {
      username: method.username,
      method_id: method.method_id,
      data: method.data,
      is_default: true,
    }

    return await api.updateBranchBankAccount(data)
  }

  return {
    updateBankAccount
  }
}
