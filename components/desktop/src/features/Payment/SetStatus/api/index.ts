import { client } from 'src/shared/api/client';
import { Mutations } from '@coopenomics/sdk';
import type { IPayment } from 'src/entities/Payment/model';

type ISetPaymentStatusInput = Mutations.Payments.SetPaymentStatus.IInput['data']

async function setPaymentStatus(data: ISetPaymentStatusInput): Promise<IPayment> {
  const { [Mutations.Payments.SetPaymentStatus.name]: result } = await client.Mutation(
    Mutations.Payments.SetPaymentStatus.mutation,
    {
      variables: {
        data
      }
    }
  );

  return result;
}

export const api = { setPaymentStatus };
