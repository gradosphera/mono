import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';

@Entity('extensions')
export class ExtensionEntity<TConfig = any> {
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

  constructor(partial?: Partial<ExtensionDomainEntity<TConfig>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  // Метод для преобразования ORM-сущности в доменную сущность
  toDomainEntity(): ExtensionDomainEntity<TConfig> {
    return new ExtensionDomainEntity<TConfig>(this.name, this.enabled, this.config, this.createdAt, this.updatedAt);
  }

  // Статический метод для создания ORM-сущности из доменной сущности
  static fromDomainEntity<TConfig>(domainEntity: Partial<ExtensionDomainEntity<TConfig>>): ExtensionEntity<TConfig> {
    return new ExtensionEntity<TConfig>(domainEntity);
  }
}
