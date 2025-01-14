import type { Cooperative } from 'cooptypes';
import { generator } from './document.service';
import type { FilterQuery } from 'mongoose';

export const savePaymentMethod = async (data: Cooperative.Payments.IPaymentData) => {
  return await generator.save('paymentMethod', data);
};

export const deletePaymentMethod = async (filter: FilterQuery<Cooperative.Payments.IPaymentData>) => {
  return await generator.del('paymentMethod', filter as any);
};

export const listPaymentMethods = async (filter: FilterQuery<Cooperative.Payments.IPaymentData>) => {
  return await generator.list('paymentMethod', filter as any);
};
