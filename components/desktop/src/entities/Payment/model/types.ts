import type { Queries } from '@coopenomics/sdk';

export type IPaymentPaginationResult =
  Queries.Gateway.GetPayments.IOutput[typeof Queries.Gateway.GetPayments.name];
export type IPayment = IPaymentPaginationResult['items'][number];

export type IGetPaymentsInputData = Queries.Gateway.GetPayments.IInput['data'];
export type IGetPaymentsInputOptions =
  Queries.Gateway.GetPayments.IInput['options'];
