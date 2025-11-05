import { Injectable } from '@nestjs/common';
import Mono from '~/models/mono.model';
import type { SystemStatusInterface } from '~/types';
import config from '~/config/config';
import { SystemStatus } from '~/application/system/dto/system-status.dto';

export const MONO_STATUS_REPOSITORY = 'MONO_STATUS_REPOSITORY';

export interface MonoStatusRepository {
  getStatus(): Promise<SystemStatusInterface>;
  setStatus(status: SystemStatusInterface): Promise<void>;
  createInstallStatus(): Promise<void>;
  setInstallCode(code: string, expiresAt: Date): Promise<void>;
  validateInstallCode(code: string): Promise<boolean>;
  getMonoDocument(): Promise<any>;
  setInitByServer(initByServer: boolean): Promise<void>;
}

@Injectable()
export class MonoStatusRepositoryImpl implements MonoStatusRepository {
  async getStatus(): Promise<SystemStatusInterface> {
    const mono = await Mono.findOne({ coopname: config.coopname });

    if (!mono || !mono.status) return SystemStatus.install;
    return mono.status;
  }

  async setStatus(status: SystemStatusInterface): Promise<void> {
    await Mono.updateOne({ coopname: config.coopname }, { status }, { upsert: true });
  }

  async createInstallStatus(): Promise<void> {
    await Mono.updateOne({ coopname: config.coopname }, { status: SystemStatus.install }, { upsert: true });
  }

  async setInstallCode(code: string, expiresAt: Date): Promise<void> {
    await Mono.updateOne(
      { coopname: config.coopname },
      {
        install_code: code,
        install_code_expires_at: expiresAt,
      },
      { upsert: true }
    );
  }

  async validateInstallCode(code: string): Promise<boolean> {
    const mono = await Mono.findOne({
      coopname: config.coopname,
      install_code: code,
      install_code_expires_at: { $gt: new Date() },
    });

    return !!mono;
  }

  async getMonoDocument(): Promise<any> {
    return await Mono.findOne({ coopname: config.coopname });
  }

  async setInitByServer(initByServer: boolean): Promise<void> {
    await Mono.updateOne({ coopname: config.coopname }, { init_by_server: initByServer }, { upsert: true });
  }
}
