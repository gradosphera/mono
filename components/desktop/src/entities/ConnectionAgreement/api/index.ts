import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';

/**
 * Тип текущего инстанса из GraphQL API
 */
export type CurrentInstance = Queries.System.GetCurrentInstance.IOutput[typeof Queries.System.GetCurrentInstance.name];

/**
 * Получить текущий инстанс авторизованного пользователя
 */
export async function getCurrentInstance(): Promise<CurrentInstance | null> {
  try {
    const { [Queries.System.GetCurrentInstance.name]: instance } =
      await client.Query(Queries.System.GetCurrentInstance.query);

    return instance;
  } catch (error) {
    console.error('Ошибка при получении текущего инстанса:', error);
    return null;
  }
}

export const api = {
  getCurrentInstance
};
