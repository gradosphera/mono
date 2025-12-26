import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SystemStatusEntity } from '~/infrastructure/database/typeorm/entities/system-status.entity';
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
  constructor(
    @InjectRepository(SystemStatusEntity)
    private readonly systemStatusRepository: Repository<SystemStatusEntity>
  ) {}

  async getStatus(): Promise<SystemStatusInterface> {
    const entity = await this.systemStatusRepository.findOne({
      where: { coopname: config.coopname },
    });

    if (!entity || !entity.status) return SystemStatus.install;
    return entity.status;
  }

  async setStatus(status: SystemStatusInterface): Promise<void> {
    await this.systemStatusRepository.upsert({ coopname: config.coopname, status: status as SystemStatus }, ['coopname']);
  }

  async createInstallStatus(): Promise<void> {
    await this.systemStatusRepository.upsert({ coopname: config.coopname, status: SystemStatus.install }, ['coopname']);
  }

  async setInstallCode(code: string, expiresAt: Date): Promise<void> {
    await this.systemStatusRepository.upsert(
      {
        coopname: config.coopname,
        install_code: code,
        install_code_expires_at: expiresAt,
      },
      ['coopname']
    );
  }

  async validateInstallCode(code: string): Promise<boolean> {
    const entity = await this.systemStatusRepository
      .createQueryBuilder('system_status')
      .where('system_status.coopname = :coopname', { coopname: config.coopname })
      .andWhere('system_status.install_code = :code', { code })
      .andWhere('system_status.install_code_expires_at > :now', { now: new Date() })
      .getOne();

    return !!entity;
  }

  async getMonoDocument(): Promise<any> {
    const entity = await this.systemStatusRepository.findOne({
      where: { coopname: config.coopname },
    });

    return entity ? entity.toDomainEntity() : null;
  }

  async setInitByServer(initByServer: boolean): Promise<void> {
    await this.systemStatusRepository.upsert({ coopname: config.coopname, init_by_server: initByServer }, ['coopname']);
  }
}
