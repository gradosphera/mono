import { api } from '../api';
import { Mutations } from '@coopenomics/coopjs'

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

  async function updateBankAccount(data: Mutations.PaymentMethods.UpdateBankAccount.IInput['data']) {
    data.is_default = true
    return await api.updateBankAccount(data)
  }

  return {
    updateBankAccount
  }
}
