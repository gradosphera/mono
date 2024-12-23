import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/coopjs';
import type { ISystemInfo } from '../types';

async function loadSystemInfo(): Promise<ISystemInfo> {
  const { [Queries.System.GetSystemInfo.name]: output } = await client.Query(Queries.System.GetSystemInfo.query);
  return output;
}

export const api ={
  loadSystemInfo
}
