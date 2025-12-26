import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * TypeORM сущность для хранения состояния обработки платежей
 * Используется для отслеживания прогресса обработки выписок платежных систем
 */
@Entity('payment_state')
export class PaymentStateEntity {
  @PrimaryColumn({ length: 50 })
  accountNumber!: string;

  @PrimaryColumn({ length: 10 })
  statementDate!: string;

  @Column({ default: 1 })
  lastProcessedPage!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  constructor(data?: Partial<PaymentStateEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  /**
   * Преобразует ORM-сущность в доменную сущность
   */
  toDomainEntity() {
    return {
      accountNumber: this.accountNumber,
      statementDate: this.statementDate,
      lastProcessedPage: this.lastProcessedPage,
    };
  }

  /**
   * Создает ORM-сущность из доменных данных
   */
  static fromDomainEntity(data: {
    accountNumber: string;
    statementDate: string;
    lastProcessedPage: number;
  }): PaymentStateEntity {
    return new PaymentStateEntity(data);
  }
}
