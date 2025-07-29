import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type {
  IGetLedgerInput,
  ILedgerState,
  IGetLedgerHistoryInput,
  ILedgerHistoryResponse,
} from '../types';

async function getLedger(
  data: IGetLedgerInput,
): Promise<ILedgerState | undefined> {
  const { [Queries.Ledger.GetLedger.name]: output } = await client.Query(
    Queries.Ledger.GetLedger.query,
    {
      variables: {
        data,
      },
    },
  );

  return output;
}

async function getLedgerHistory(
  data: IGetLedgerHistoryInput,
): Promise<ILedgerHistoryResponse | undefined> {
  const { [Queries.Ledger.GetLedgerHistory.name]: output } = await client.Query(
    Queries.Ledger.GetLedgerHistory.query,
    {
      variables: {
        data,
      },
    },
  );

  return output;
}

export const api = {
  getLedger,
  getLedgerHistory,
};
