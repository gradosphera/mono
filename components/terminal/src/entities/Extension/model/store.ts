import { defineStore } from 'pinia'
import { ref, Ref } from 'vue'
import { api } from '../api'
import type { IGetExtensions } from '@coopenomics/coopjs/queries/getExtensions'
import type { IExtension, IGetExtensionsInput } from './types';

const namespace = 'extensionStore';

interface IExtensionStore {
  extensions: Ref<IExtension[]>
  loadExtensions: (data?: IGetExtensionsInput) => void;
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

  const loadExtensions = async (data?: IGetExtensionsInput) => {
    const loadedData = await api.loadExtensions(data);

    const transformedData = loadedData.map((value) => {
      const typedValue = value as IGetExtensions['getExtensions'][number];
      const schema = typedValue.schema as IExtension['schema'] | undefined; // schema может быть undefined

      return {
        ...typedValue,
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

    console.log('transformedData: ', transformedData);
    extensions.value = transformedData; // сохраняем преобразованные данные
  };

  return {
    extensions,
    loadExtensions
  }
})
