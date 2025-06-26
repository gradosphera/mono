import type { Mutations } from '@coopenomics/sdk';

// Новые типы на основе SDK
export type IPaymentOrder =
  Mutations.Gateway.CreateDepositPayment.IOutput[typeof Mutations.Gateway.CreateDepositPayment.name];

export type IInitialPaymentOrder =
  Mutations.Participants.CreateInitialPayment.IOutput[typeof Mutations.Participants.CreateInitialPayment.name];
