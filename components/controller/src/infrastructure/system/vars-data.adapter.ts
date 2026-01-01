import { Inject, Injectable } from '@nestjs/common';
import { VarsDataPort } from '~/domain/system/ports/vars-data.port';
import { VarsRepository, VARS_REPOSITORY } from '~/domain/common/repositories/vars.repository';
import type { VarsDomainInterface } from '~/domain/system/interfaces/vars-domain.interface';

@Injectable()
export class VarsDataAdapter implements VarsDataPort {
  constructor(@Inject(VARS_REPOSITORY) private readonly varsRepository: VarsRepository) {}

  async get(): Promise<VarsDomainInterface | null> {
    return this.varsRepository.get();
  }

  async create(data: VarsDomainInterface): Promise<void> {
    return this.varsRepository.create(data);
  }
}
