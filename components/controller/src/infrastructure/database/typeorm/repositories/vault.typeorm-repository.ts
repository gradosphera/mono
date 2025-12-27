import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultEntity } from '../entities/vault.entity';
import type { VaultRepository } from '~/domain/vault/repositories/vault.repository';
import type { VaultDomainEntity } from '~/domain/vault/entities/vault-domain.entity';
import { wifPermissions } from '~/domain/vault/types/vault.types';

/**
 * Реализация репозитория vault на базе TypeORM
 * Адаптер между доменным слоем и инфраструктурой базы данных
 */
@Injectable()
export class VaultTypeormRepository implements VaultRepository {
  constructor(
    @InjectRepository(VaultEntity)
    private readonly repository: Repository<VaultEntity>
  ) {}

  /**
   * Получает WIF ключ по имени пользователя и разрешению
   */
  async getWif(username: string, permission: wifPermissions = wifPermissions.Active): Promise<string | null> {
    const entity = await this.repository.findOne({
      where: { username, permission },
    });

    return entity ? entity.wif : null;
  }

  /**
   * Устанавливает/обновляет WIF ключ для пользователя
   */
  async setWif(username: string, wif: string, permission: wifPermissions = wifPermissions.Active): Promise<boolean> {
    const result = await this.repository.upsert(
      {
        username,
        permission,
        wif,
      },
      {
        conflictPaths: ['username', 'permission'],
        skipUpdateIfNoValuesChanged: false,
      }
    );

    return result.identifiers.length > 0;
  }

  /**
   * Находит запись vault по имени пользователя и разрешению
   */
  async findByUsernameAndPermission(username: string, permission: wifPermissions): Promise<VaultDomainEntity | null> {
    const entity = await this.repository.findOne({
      where: { username, permission },
    });

    return entity ? entity.toDomainEntity() : null;
  }
}
