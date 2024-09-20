import Settings from '../models/settings.model';
import type { ISettings } from '../types';

export const getSettings = async (): Promise<ISettings> => {
  return await Settings.getSettings();
};

export const updateSettings = async (settings: Partial<ISettings>) => {
  await Settings.updateSettings(settings);
};
