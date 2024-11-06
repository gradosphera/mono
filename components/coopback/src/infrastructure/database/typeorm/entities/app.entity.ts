import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AppStoreDomainEntity } from '~/domain/appstore/entities/appstore-domain.entity';

@Entity('apps')
export class AppEntity<TConfig = any> {
  @PrimaryColumn({ unique: true, length: 12 })
  name!: string;

  @Column({ default: true })
  enabled!: boolean;

  @Column('jsonb', { default: {} })
  config!: TConfig;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  setDefaultConfig() {
    if (this.config === null || this.config === undefined) {
      this.config = {} as TConfig;
    }
  }

  // Метод для преобразования ORM-сущности в доменную сущность
  toDomainEntity(): AppStoreDomainEntity<TConfig> {
    return new AppStoreDomainEntity<TConfig>(this.name, this.enabled, this.config, this.createdAt, this.updatedAt);
  }

  // Статический метод для создания ORM-сущности из доменной сущности
  static fromDomainEntity<TConfig>(domainEntity: AppStoreDomainEntity<TConfig>): AppEntity<TConfig> {
    const ormEntity = new AppEntity<TConfig>();
    ormEntity.name = domainEntity.name;
    ormEntity.enabled = domainEntity.enabled;
    ormEntity.config = domainEntity.config;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }
}
