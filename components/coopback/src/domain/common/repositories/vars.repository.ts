import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';

export interface VarsRepository {
  get(): Promise<VarsDomainInterface | null>;
  create(data: VarsDomainInterface);
}

export const VARS_REPOSITORY = Symbol('VarsRepository'); // Создаем уникальный токен
