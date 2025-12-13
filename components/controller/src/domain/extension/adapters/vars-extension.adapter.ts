import { Inject, Injectable } from '@nestjs/common';
import { VarsExtensionPort } from '../ports/vars-extension-port';
import { VarsRepository, VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';

@Injectable()
export class VarsExtensionAdapter implements VarsExtensionPort {
  constructor(@Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository) {}

  async get(): Promise<VarsDomainInterface | null> {
    return this.varsRepository.get();
  }

  async create(data: VarsDomainInterface): Promise<void> {
    return this.varsRepository.create(data);
  }
}
