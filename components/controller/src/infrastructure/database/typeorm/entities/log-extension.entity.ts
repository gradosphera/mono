import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { LogExtensionDomainEntity } from '~/domain/extension/entities/log-extension-domain.entity';
import type { LogExtensionDomainInterface } from '~/domain/extension/interfaces/log-extension-domain.interface';

@Entity('extensions_logs')
export class LogExtensionEntity<TLog = any> implements LogExtensionDomainInterface<TLog> {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 12, nullable: false })
  name!: string;

  @Column({ default: 0 })
  extension_local_id!: number;

  @Column('jsonb', { default: {} })
  data!: TLog;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor(data?: LogExtensionDomainEntity<TLog>) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.extension_local_id = data.extension_local_id;
      this.data = data.data;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }
  }

  // Метод для преобразования ORM-сущности в доменную сущность
  toDomainEntity(): LogExtensionDomainEntity<TLog> {
    return new LogExtensionDomainEntity<TLog>(
      this.id,
      this.name,
      this.extension_local_id,
      this.data,
      this.created_at,
      this.updated_at
    );
  }

  // Статический метод для создания ORM-сущности из доменной сущности
  static fromDomainEntity<TLog>(domainEntity: LogExtensionDomainEntity<TLog>): LogExtensionEntity<TLog> {
    return new LogExtensionEntity<TLog>(domainEntity);
  }
}
