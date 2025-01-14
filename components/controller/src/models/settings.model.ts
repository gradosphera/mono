import mongoose, { Schema, Document, model, type Model } from 'mongoose';
import { toJSON, paginate } from './plugins/index';
import _ from 'lodash';
import type { ISettings } from '../types';

export interface ISettingsModel extends Model<ISettings> {
  updateSettings(newSettings: Partial<ISettings>): Promise<ISettings>;
  getSettings(): Promise<ISettings>;
}

// Определение схемы
const settingsSchema = new Schema<ISettings>(
  {
    provider: {
      name: { type: String, required: true, default: 'qrpay' },
      client: { type: String, default: '' },
      secret: { type: String, default: '' },
    },
    app: {
      title: { type: String, required: true, default: 'Цифровой Кооператив' },
      description: { type: String, required: true, default: 'Система электронного документооборота для кооперативов' },
    },
  },
  {
    timestamps: true,
  }
);

// Подключаем плагины
settingsSchema.plugin(toJSON);
settingsSchema.plugin(paginate);

// Статические методы
settingsSchema.statics.updateSettings = async function (newSettings: Partial<ISettings>): Promise<ISettings> {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
  }

  // Универсальное обновление всех полей
  _.merge(settings, newSettings);
  return settings.save();
};

settingsSchema.statics.getSettings = async function (): Promise<ISettings> {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  return settings;
};

// Модель
const Settings = model<ISettings, ISettingsModel>('Settings', settingsSchema);

export default Settings;
