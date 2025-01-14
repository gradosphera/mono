import { IBaseReadBlockchainErrors } from '../lib/types/errors';
import { FailAlert } from '../api/alerts';

export function createBaseReadBlockchainErrors(
  name: string
): IBaseReadBlockchainErrors {
  return {
    loadError: createBlockchainGetError(name),
  };
}

export function createBlockchainGetError(name: string) {
  return `Не удалось загрузить ${name} из блокчейна`;
}

export function handleException(e: unknown): void {
  if (e instanceof Error) {
    FailAlert(e.message);
  } else {
    FailAlert('Произошла неизвестная ошибка');
  }
}

export function extractGraphQLErrorMessages(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Unknown error';

  // Проверяем, если ошибка уже является массивом
  if (Array.isArray(error)) {
    return error.map((err: any) => err.message || 'Unknown error').join('; ');
  }

  // Обрабатываем, если это объект с полем `errors` (например, Apollo Client)
  const errors = (error as any).errors;
  if (Array.isArray(errors)) {
    return errors.map((err: any) => err.message || 'Unknown error').join('; ');
  }

  // Обработка в случае, если ошибка — одиночная
  return (error as any).message || 'Unknown error';
}
