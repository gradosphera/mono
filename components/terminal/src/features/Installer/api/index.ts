import type { IInstall } from '@coopenomics/controller';
import { sendPOST } from 'src/shared/api';

async function install(data: IInstall): Promise<void> {
  const response = await sendPOST('/v1/system/install', data);

  return response;
}


export const api = {
  install
}
