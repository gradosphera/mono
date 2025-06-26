import { Mutations } from '@coopenomics/sdk';
import { client } from 'src/shared/api/client';
import type { ICreateInitialPayment } from 'src/entities/Wallet/model/types';
import type { IInitialPaymentOrder } from 'src/shared/lib/types/payments';

async function createInitialPayment(
  data: ICreateInitialPayment,
): Promise<IInitialPaymentOrder> {
  const { [Mutations.Participants.CreateInitialPayment.name]: result } =
    await client.Mutation(
      Mutations.Participants.CreateInitialPayment.mutation,
      {
        variables: {
          data,
        },
      },
    );

  return result;
}

export const api = {
  createInitialPayment,
};
