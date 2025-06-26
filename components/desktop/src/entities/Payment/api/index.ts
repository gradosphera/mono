import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetPaymentsInputData,
  IGetPaymentsInputOptions,
  IPaymentPaginationResult,
} from '../model/types';

/**
 * Загружает список платежей с использованием GraphQL API
 */
async function loadPayments(
  data?: IGetPaymentsInputData,
  options?: IGetPaymentsInputOptions,
): Promise<IPaymentPaginationResult> {
  const variables: Queries.Gateway.GetPayments.IInput = {
    data,
    options,
  };

  const { [Queries.Gateway.GetPayments.name]: output } = await client.Query(
    Queries.Gateway.GetPayments.query,
    {
      variables: variables as Record<string, unknown>,
    },
  );
  return output;
}

export const api = { loadPayments };
