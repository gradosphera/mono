import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';

/**
 * Доменный порт для получения данных переменных системы
 * Используется расширениями для доступа к системным переменным
 */
export interface VarsDataPort {
  get(): Promise<VarsDomainInterface | null>;
  create(data: VarsDomainInterface): Promise<void>;
}

export const VARS_DATA_PORT = Symbol('VarsDataPort');
