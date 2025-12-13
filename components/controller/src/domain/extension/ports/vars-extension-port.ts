import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';

export interface VarsExtensionPort {
  get(): Promise<VarsDomainInterface | null>;

  create(data: VarsDomainInterface): Promise<void>;
}

export const VARS_EXTENSION_PORT = Symbol('VarsExtensionPort');
