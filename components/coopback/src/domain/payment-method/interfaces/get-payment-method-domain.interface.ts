export interface GetPaymentMethodDomainInterface {
  username: string;
  method_type: 'bank_transfer' | 'spb';
  is_default?: boolean;
  block_num?: number;
}
