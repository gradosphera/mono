import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import type { PaymentRepository } from '~/domain/gateway/repositories/payment.repository';
import type { PaymentDomainInterface } from '~/domain/gateway/interfaces/payment-domain.interface';
import type { InternalPaymentFiltersDomainInterface } from '~/domain/gateway/interfaces/payment-filters-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import { PaymentStatusEnum } from '~/domain/gateway/enums/payment-status.enum';
import { PaymentDirectionEnum, PaymentTypeEnum } from '~/domain/gateway/enums/payment-type.enum';

@Injectable()
export class TypeOrmPaymentRepository implements PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>
  ) {}

  async findById(id: string): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) return null;
    return this.mapToDomainEntity(payment);
  }

  async findByHash(hash: string): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ hash });
    if (!payment) return null;
    return this.mapToDomainEntity(payment);
  }

  async create(data: PaymentDomainInterface): Promise<PaymentDomainInterface> {
    const payment = new PaymentEntity();
    payment.hash = data.hash;
    payment.coopname = data.coopname;
    payment.username = data.username;
    payment.quantity = data.quantity;
    payment.symbol = data.symbol;
    payment.payment_method_id = data.payment_method_id;
    payment.status = data.status;
    payment.type = data.type;
    payment.direction = data.direction;
    payment.provider = data.provider;
    payment.secret = data.secret;
    payment.message = data.message;
    payment.expired_at = data.expired_at;
    payment.created_at = data.created_at;
    payment.memo = data.memo;
    payment.payment_details = data.payment_details;
    payment.blockchain_data = data.blockchain_data;
    payment.statement = data.statement;

    const createdEntity = await this.paymentRepository.save(payment);
    return this.mapToDomainEntity(createdEntity);
  }

  async update(id: string, data: Partial<PaymentDomainInterface>): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) return null;

    Object.assign(payment, data);
    payment.updated_at = new Date();

    const updatedEntity = await this.paymentRepository.save(payment);
    return this.mapToDomainEntity(updatedEntity);
  }

  async updatePaymentWithBlockchainData(hash: string, blockchain_data: any): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ hash });
    if (!payment) return null;

    payment.blockchain_data = blockchain_data;
    payment.updated_at = new Date();

    const updatedEntity = await this.paymentRepository.save(payment);
    return this.mapToDomainEntity(updatedEntity);
  }

  async setPaymentStatus(id: string, status: PaymentStatusEnum): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ id });
    if (!payment) return null;

    payment.status = status;
    payment.updated_at = new Date();

    const updatedEntity = await this.paymentRepository.save(payment);
    return this.mapToDomainEntity(updatedEntity);
  }

  async getAllPayments(
    filters: InternalPaymentFiltersDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<PaymentDomainInterface>> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (filters.direction) {
      queryBuilder.where('payment.direction = :direction', { direction: filters.direction });
    } else if (filters.type) {
      if (filters.type === PaymentTypeEnum.WITHDRAWAL) {
        queryBuilder.where('payment.direction = :direction', { direction: PaymentDirectionEnum.OUTGOING });
      } else {
        queryBuilder.where('payment.direction = :direction', { direction: PaymentDirectionEnum.INCOMING });
      }
    }

    if (filters.username) {
      queryBuilder.andWhere('payment.username ILIKE :username', { username: `%${filters.username}%` });
    }

    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    if (filters.coopname) {
      queryBuilder.andWhere('payment.coopname = :coopname', { coopname: filters.coopname });
    }

    if (filters.provider) {
      queryBuilder.andWhere('payment.provider = :provider', { provider: filters.provider });
    }

    if (filters.secret) {
      queryBuilder.andWhere('payment.secret = :secret', { secret: filters.secret });
    }

    if (filters.hash) {
      queryBuilder.andWhere('payment.hash = :hash', { hash: filters.hash });
    }

    queryBuilder.orderBy('payment.created_at', 'DESC');

    const limit = options.limit || 10;
    const page = options.page || 1;
    const skip = (page - 1) * limit;

    queryBuilder.take(limit).skip(skip);

    const [payments, totalCount] = await queryBuilder.getManyAndCount();

    const items = payments.map((payment) => this.mapToDomainEntity(payment));

    return {
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  private mapToDomainEntity(entity: PaymentEntity): PaymentDomainInterface {
    return {
      id: entity.id,
      hash: entity.hash,
      coopname: entity.coopname,
      username: entity.username,
      quantity: entity.quantity,
      symbol: entity.symbol,
      payment_method_id: entity.payment_method_id,
      status: entity.status,
      type: entity.type,
      direction: entity.direction,
      provider: entity.provider,
      secret: entity.secret,
      message: entity.message,
      expired_at: entity.expired_at,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      memo: entity.memo,
      payment_details: entity.payment_details,
      blockchain_data: entity.blockchain_data,
      statement: entity.statement,
    };
  }

  /**
   * Обновить все истекшие платежи в статус EXPIRED
   * @returns количество обновленных платежей
   */
  async expireOutdatedPayments(): Promise<number> {
    const now = new Date();

    const result = await this.paymentRepository
      .createQueryBuilder()
      .update(PaymentEntity)
      .set({
        status: PaymentStatusEnum.EXPIRED,
        updated_at: now,
      })
      .where('expired_at IS NOT NULL')
      .andWhere('expired_at < :now', { now })
      .andWhere('status = :status', { status: PaymentStatusEnum.PENDING })
      .execute();

    return result.affected || 0;
  }

  /**
   * Найти активный платеж того же типа для пользователя
   * @param username имя пользователя
   * @param type тип платежа
   * @param quantity количество
   * @param symbol символ валюты
   * @returns активный платеж или null
   */
  async findActivePendingPayment(
    username: string,
    type: PaymentTypeEnum,
    quantity: number,
    symbol: string
  ): Promise<PaymentDomainInterface | null> {
    const now = new Date();

    const payment = await this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.username = :username', { username })
      .andWhere('payment.type = :type', { type })
      .andWhere('payment.quantity = :quantity', { quantity })
      .andWhere('payment.symbol = :symbol', { symbol })
      .andWhere('payment.status = :status', { status: PaymentStatusEnum.PENDING })
      .andWhere('(payment.expired_at IS NULL OR payment.expired_at > :now)', { now })
      .orderBy('payment.created_at', 'DESC')
      .getOne();

    if (!payment) return null;
    return this.mapToDomainEntity(payment);
  }
}
