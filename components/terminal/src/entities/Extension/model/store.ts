import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IExtension } from './types';
import type { ModelTypes } from '@coopenomics/coopjs';

const namespace = 'extensionStore';

interface IExtensionStore {
  extensions: Ref<IExtension[]>
  loadExtensions: (data?: ModelTypes['GetExtensionsInput']) => void;
}

const parseDescriptionsRecursively = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj; // Если obj не объект, просто возвращаем его
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (key === 'description' && typeof value === 'string') {
        try {
          return [key, JSON.parse(value)];
        } catch (error) {
          console.error(`Failed to parse description for key ${key}:`, error);
          return [key, value]; // Оставляем строку, если парсинг не удался
        }
      } else if (typeof value === 'object') {
        // Рекурсивно обрабатываем вложенные объекты
        return [key, parseDescriptionsRecursively(value)];
      } else {
        return [key, value];
      }
    })
  );
};



export const useExtensionStore = defineStore(namespace, (): IExtensionStore => {
  const extensions = ref<IExtension[]>([])

  const loadExtensions = async (data?: ModelTypes['GetExtensionsInput']) => {
    const loadedData = await api.loadExtensions(data);

    const transformedData = loadedData.map((value) => {
      const schema = value.schema as IExtension['schema'] | undefined; // schema может быть undefined

      return {
        ...value,
        schema: schema
          ? {
              ...schema,
              properties: schema.properties
                ? parseDescriptionsRecursively(schema.properties)
                : {}, // если properties отсутствует, возвращаем пустой объект
            }
          : undefined, // если schema отсутствует, возвращаем undefined
      };
    });

    extensions.value = transformedData; // сохраняем преобразованные данные
  };

  return {
    extensions,
    loadExtensions
  }
})
