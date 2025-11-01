import { Injectable } from '@nestjs/common';
import Mono from '~/models/mono.model';
import type { SystemStatusInterface } from '~/types';
import config from '~/config/config';

export const MONO_STATUS_REPOSITORY = 'MONO_STATUS_REPOSITORY';

export interface MonoStatusRepository {
  getStatus(): Promise<SystemStatusInterface>;
  setStatus(status: SystemStatusInterface): Promise<void>;
  createInstallStatus(): Promise<void>;
}

@Injectable()
export class MonoStatusRepositoryImpl implements MonoStatusRepository {
  async getStatus(): Promise<SystemStatusInterface> {
    const mono = await Mono.findOne({ coopname: config.coopname });

    if (!mono) return 'maintenance';
    return mono.status;
  }

  async setStatus(status: SystemStatusInterface): Promise<void> {
    await Mono.updateOne({ coopname: config.coopname }, { status });
  }

  async createInstallStatus(): Promise<void> {
    await Mono.create({
      coopname: config.coopname,
      status: 'install',
    });
  }
}
