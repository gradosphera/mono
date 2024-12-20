import { client } from 'src/shared/api/client';
import { Queries, type ModelTypes } from '@coopenomics/coopjs';

async function loadSystemInfo(): Promise<ModelTypes['SystemInfo']> {
  const { getSystemInfo: output } = await client.Query(Queries.getSystemInfo);
  return output;
}

export const api ={
  loadSystemInfo
}
