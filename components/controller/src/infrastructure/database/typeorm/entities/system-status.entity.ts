import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SystemStatus } from '~/application/system/dto/system-status.dto';

/**
 * TypeORM сущность для хранения статуса системы кооператива
 */
@Entity('system_status')
export class SystemStatusEntity {
  @PrimaryColumn({ unique: true, length: 12 })
  coopname!: string;

  @Column({
    type: 'enum',
    enum: SystemStatus,
    default: SystemStatus.install,
  })
  status!: SystemStatus;

  @Column({ nullable: true, length: 255 })
  install_code?: string;

  @Column({ nullable: true })
  install_code_expires_at?: Date;

  @Column({ default: false })
  init_by_server!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor(data?: Partial<SystemStatusEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Преобразует ORM-сущность в доменную сущность
   */
  toDomainEntity() {
    return {
      coopname: this.coopname,
      status: this.status,
      install_code: this.install_code,
      install_code_expires_at: this.install_code_expires_at,
      init_by_server: this.init_by_server,
    };
  }

  /**
   * Создает ORM-сущность из доменных данных
   */
  static fromDomainEntity(data: {
    coopname: string;
    status: SystemStatus;
    install_code?: string;
    install_code_expires_at?: Date;
    init_by_server?: boolean;
  }): SystemStatusEntity {
    return new SystemStatusEntity(data);
  }
}
