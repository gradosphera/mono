import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LogExtensionDomainEntity } from '~/domain/extension/entities/log-extension-domain.entity';

@Entity('extensions_logs')
export class LogExtensionEntity<TLog = any> {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 12, nullable: false })
  name!: string;

  @Column('jsonb', { default: {} })
  data!: TLog;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor(partial?: Partial<LogExtensionDomainEntity<TLog>>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }

  // Метод для преобразования ORM-сущности в доменную сущность
  toDomainEntity(): LogExtensionDomainEntity<TLog> {
    return new LogExtensionDomainEntity<TLog>(this.id, this.name, this.data, this.createdAt, this.updatedAt);
  }

  // Статический метод для создания ORM-сущности из доменной сущности
  static fromDomainEntity<TLog>(domainEntity: Partial<LogExtensionDomainEntity<TLog>>): LogExtensionEntity<TLog> {
    return new LogExtensionEntity<TLog>(domainEntity);
  }
}
