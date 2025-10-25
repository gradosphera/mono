import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SettingsDomainEntity } from '~/domain/settings/entities/settings-domain.entity';
import type { SettingsDomainInterface } from '~/domain/settings/interfaces/settings-domain.interface';

/**
 * TypeORM сущность для настроек системы
 * Хранит конфигурацию рабочих столов и маршрутов по умолчанию
 */
@Entity('settings')
export class SettingsEntity implements SettingsDomainInterface {
  @PrimaryColumn({ unique: true, length: 12 })
  coopname!: string;

  @Column({ length: 50 })
  authorized_default_workspace!: string;

  @Column({ length: 50 })
  authorized_default_route!: string;

  @Column({ length: 50 })
  non_authorized_default_workspace!: string;

  @Column({ length: 50 })
  non_authorized_default_route!: string;

  @Column('jsonb', { default: {} })
  extra_settings?: Record<string, any>;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  setDefaultExtraSettings() {
    if (this.extra_settings === null || this.extra_settings === undefined) {
      this.extra_settings = {};
    }
  }

  constructor(data?: SettingsDomainEntity) {
    if (data) {
      this.coopname = data.coopname;
      this.authorized_default_workspace = data.authorized_default_workspace;
      this.authorized_default_route = data.authorized_default_route;
      this.non_authorized_default_workspace = data.non_authorized_default_workspace;
      this.non_authorized_default_route = data.non_authorized_default_route;
      this.extra_settings = data.extra_settings;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }
  }

  /**
   * Преобразует ORM-сущность в доменную сущность
   */
  toDomainEntity(): SettingsDomainEntity {
    return new SettingsDomainEntity(this);
  }

  /**
   * Создает ORM-сущность из доменной сущности
   */
  static fromDomainEntity(domainEntity: SettingsDomainEntity): SettingsEntity {
    return new SettingsEntity(domainEntity);
  }
}
