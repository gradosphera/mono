import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';
import type { IChatCoopAccountStatus } from '../model/types';

async function getAccountStatus(): Promise<IChatCoopAccountStatus> {
  const { [Queries.ChatCoop.GetAccountStatus.name]: output } = await client.Query(
    Queries.ChatCoop.GetAccountStatus.query,
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
