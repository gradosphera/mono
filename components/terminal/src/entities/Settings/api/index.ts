import type { ISettings } from 'coopback';
import { sendGET } from 'src/shared/api';

async function loadSettings(): Promise<ISettings> {
  return (await sendGET('/v1/system/settings', {})) as ISettings;
}

export const api = {loadSettings}
