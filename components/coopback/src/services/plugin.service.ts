import { PluginConfig } from '../models/pluginConfig.model';
import Joi from 'joi';
import { PluginRegistry } from '../plugins';
import parse from 'joi-to-json';

import ApiError from '../utils/ApiError';
import httpStatus from 'http-status';

// Динамическое создание объектов и сбор схем
const getPluginSchemasInternal = () => {
  const pluginSchemas = Object.entries(PluginRegistry).reduce((schemas, [key, PluginModule]) => {
    const pluginInstance = new PluginModule.Plugin();
    schemas[pluginInstance.name] = pluginInstance.pluginSchema;
    return schemas;
  }, {} as { [key: string]: Joi.ObjectSchema });
  return pluginSchemas;
};

// Функция для обновления конфигурации плагина
export const updatePluginConfig = async (pluginName: string, enabled: boolean, config: any) => {
  const schema = getPluginSchemasInternal()[pluginName];
  if (!schema) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Схема для плагина ${pluginName} не найдена.`);
  }

  // Валидация переданных параметров
  const { error } = schema.validate(config);

  if (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Ошибка валидации конфигурации плагина ${pluginName}: ${error.message}`);
  }

  // Обновление конфигурации в базе данных
  const pluginConfig = await PluginConfig.findOneAndUpdate(
    { name: pluginName },
    { enabled, config },
    { new: true, upsert: true }
  );

  return pluginConfig;
};

// Метод для извлечения Joi схемы
export const getPluginSchema = (pluginName: string) => {
  const pluginInstance = getPluginSchemasInternal()[pluginName];

  if (!pluginInstance) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Плагин не найден');
  }
  // Преобразование Joi схемы в JSON
  try {
    const jsonSchema = parse(pluginInstance);
    return jsonSchema;
  } catch (e: any) {
    console.log('on error');
    throw new ApiError(httpStatus.BAD_REQUEST, e.message);
  }
};

// Метод для извлечения Joi схемы
export const getPluginConfig = async (pluginName: string): Promise<any> => {
  const config = await PluginConfig.findOne({ name: pluginName });

  return config;
};

export const queryPlugins = async (filter, options) => {
  const plugins = await PluginConfig.paginate(filter, options);

  return plugins;
};
