import type { ISettings } from '@coopenomics/controller';
import { sendPOST } from 'src/shared/api';

async function updateSettings(data: Partial<ISettings>): Promise<void> {
  await sendPOST('/v1/system/settings', data);
}


export const api = {
  updateSettings
}
