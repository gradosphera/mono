export interface GetPaymentMethodDomainInterface {
  username: string;
  method_type?: 'bank_transfer' | 'spb';
  method_id?: string;
  is_default?: boolean;
  block_num?: number;
}
