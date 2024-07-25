import { Cooperative } from 'cooptypes';

export type IPaymentData = Cooperative.Documents.IGetResponse<Cooperative.Payments.IPaymentData>

export interface IGetPaymentMethods {
  username?: number
}

export interface IDeletePaymentMethod {
  username: number;
  method_id: number;
}

export interface IAddPaymentMethod {
  username: string;
  method_id: number;
  method_type: 'sbp' | 'bank_transfer';
  data: {
      phone: string;
    } | ({
      account_number: string;
      bank_name: string;
      card_number?: string;
      currency: 'RUB' | 'Other';
      details: {
        bik: string;
        corr: string;
        kpp: string;
      };
    });
}
