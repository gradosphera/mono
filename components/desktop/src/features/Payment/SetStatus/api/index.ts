import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IPayment } from 'src/entities/Payment/model';

export type ISetPaymentStatusInput =
  Mutations.Gateway.SetPaymentStatus.IInput['data'];

async function setPaymentStatus(
  data: ISetPaymentStatusInput,
): Promise<IPayment> {
  const { [Mutations.Gateway.SetPaymentStatus.name]: result } =
    await client.Mutation(Mutations.Gateway.SetPaymentStatus.mutation, {
      variables: {
        data,
      },
    });

  return result;
}

export const api = { setPaymentStatus };
