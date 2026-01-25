import type { UdataDomainInterface } from '~/domain/common/interfaces/udata-domain.interface';
import { Cooperative } from 'cooptypes';

export interface UdataRepository {
  save(data: Omit<UdataDomainInterface, '_id' | 'block_num' | 'deleted'>): Promise<void>;
  get(coopname: string, username: string, key: Cooperative.Model.UdataKey | string, filters?: Partial<Pick<UdataDomainInterface, 'metadata' | 'block_num' | 'deleted'>>): Promise<UdataDomainInterface | null>;
  getHistory(coopname: string, username: string, key: Cooperative.Model.UdataKey | string): Promise<UdataDomainInterface[]>;
  getAll(coopname: string, username?: string): Promise<UdataDomainInterface[]>;
  delete(coopname: string, username: string, key: Cooperative.Model.UdataKey | string): Promise<void>;
}

export const UDATA_REPOSITORY = Symbol('UdataRepository');