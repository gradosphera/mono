import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { ICoopgramAccountStatus } from '../model/types';

async function getAccountStatus(): Promise<ICoopgramAccountStatus> {
  const { [Queries.Coopgram.GetAccountStatus.name]: output } = await client.Query(
    Queries.Coopgram.GetAccountStatus.query,
  );

  return {
    hasAccount: output.hasAccount,
    matrixUsername: output.matrixUsername || undefined,
    iframeUrl: output.iframeUrl || undefined,
  };
}

export const api = {
  getAccountStatus,
};
