import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { VaultDomainEntity } from '~/domain/vault/entities/vault-domain.entity';
import type { VaultDomainInterface } from '~/domain/vault/interfaces/vault-domain.interface';
import { wifPermissions } from '~/domain/vault/types/vault.types';

/**
 * TypeORM сущность для хранения зашифрованных WIF ключей
 * Хранит приватные ключи пользователей в зашифрованном виде в PostgreSQL
 */
@Entity('vaults')
@Index(['username', 'permission'], { unique: true }) // Уникальный индекс на username + permission
@Index(['username']) // Индекс для поиска по username
export class VaultEntity implements VaultDomainInterface {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 50 })
  username!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  permission!: wifPermissions;

  @Column({ type: 'text' })
  wif!: string; // Зашифрованный WIF ключ

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  constructor(data?: VaultDomainEntity) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.permission = data.permission;
      this.wif = data.wif;
      this.createdAt = data.createdAt || new Date();
      this.updatedAt = data.updatedAt || new Date();
    }
  }

  /**
   * Преобразует ORM-сущность в доменную сущность
   */
  toDomainEntity(): VaultDomainEntity {
    return new VaultDomainEntity(this.id, this.username, this.permission, this.wif, this.createdAt, this.updatedAt);
  }

  /**
   * Создает ORM-сущность из доменной сущности
   */
  static fromDomainEntity(domainEntity: VaultDomainEntity): VaultEntity {
    return new VaultEntity(domainEntity);
  }
}
