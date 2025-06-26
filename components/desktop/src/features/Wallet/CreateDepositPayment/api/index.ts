import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';
import type { ICreateDeposit } from 'src/entities/Wallet/model/types';
import type { IPaymentOrder } from 'src/shared/lib/types/payments';

async function createDepositPayment(
  data: ICreateDeposit,
): Promise<IPaymentOrder> {
  const { [Mutations.Wallet.CreateDepositPayment.name]: result } =
    await client.Mutation(Mutations.Wallet.CreateDepositPayment.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = {
  createDepositPayment,
};
