import { sendGET } from 'src/shared/api';
import { Types } from '@coopenomics/sdk';
type ISettings = Types.Controller.ISettings;

async function loadSettings(): Promise<ISettings> {
  return (await sendGET('/v1/system/settings', {})) as ISettings;
}

export const api = {loadSettings}
