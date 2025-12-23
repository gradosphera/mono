import { sendPOST } from 'src/shared/api';
import { Types } from '@coopenomics/sdk';
type ISettings = Types.Controller.ISettings;

async function updateSettings(data: Partial<ISettings>): Promise<void> {
  await sendPOST('/v1/system/settings', data);
}


export const api = {
  updateSettings
}
