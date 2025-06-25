import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../entities/payment.entity';
import { GatewayPaymentStatusEnum } from '~/domain/gateway/enums/gateway-payment-status.enum';
import { GatewayPaymentTypeEnum } from '~/domain/gateway/enums/gateway-payment-type.enum';
import type { PaymentRepository } from '~/domain/gateway/repositories/payment.repository';
import type { PaymentDomainInterface } from '~/domain/gateway/interfaces/payment-domain.interface';
import type { OutgoingPaymentDomainInterface } from '~/domain/gateway/interfaces/outgoing-payment-domain.interface';
import type {
  PaginationInputDomainInterface,
  PaginationResultDomainInterface,
} from '~/domain/common/interfaces/pagination.interface';
import type { GetOutgoingPaymentsInputDomainInterface } from '~/domain/gateway/interfaces/get-outgoing-payments-input-domain.interface';

@Injectable()
export class TypeOrmPaymentRepository implements PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>
  ) {}

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
    payment.method_id = data.method_id;
    payment.status = data.status;
    payment.type = data.type;
    payment.created_at = data.created_at;
    payment.memo = data.memo;
    payment.payment_details = data.payment_details;
    payment.blockchain_data = data.blockchain_data;
    payment.statement = data.statement;

    const createdEntity = await this.paymentRepository.save(payment);
    return this.mapToDomainEntity(createdEntity);
  }

  async updatePaymentStatus(
    hash: string,
    status: GatewayPaymentStatusEnum,
    reason?: string
  ): Promise<PaymentDomainInterface | null> {
    const payment = await this.paymentRepository.findOneBy({ hash });
    if (!payment) return null;

    payment.status = status;
    payment.updated_at = new Date();
    if (reason) {
      payment.memo = reason;
    }

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

  async getOutgoingPayments(
    filters: GetOutgoingPaymentsInputDomainInterface,
    options: PaginationInputDomainInterface
  ): Promise<PaginationResultDomainInterface<OutgoingPaymentDomainInterface>> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    queryBuilder.where('payment.type = :type', { type: GatewayPaymentTypeEnum.OUTGOING });

    if (filters.coopname) {
      queryBuilder.andWhere('payment.coopname = :coopname', { coopname: filters.coopname });
    }

    if (filters.username) {
      queryBuilder.andWhere('payment.username = :username', { username: filters.username });
    }

    if (filters.status) {
      queryBuilder.andWhere('payment.status = :status', { status: filters.status });
    }

    queryBuilder.orderBy('payment.created_at', 'DESC');

    const limit = options.limit || 10;
    const page = options.page || 1;
    const skip = (page - 1) * limit;

    queryBuilder.take(limit).skip(skip);

    const [payments, totalCount] = await queryBuilder.getManyAndCount();

    const items = payments.map((payment) => this.mapToDomainEntity(payment) as OutgoingPaymentDomainInterface);

    return {
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  private mapToDomainEntity(entity: PaymentEntity): PaymentDomainInterface {
    return {
      hash: entity.hash,
      coopname: entity.coopname,
      username: entity.username,
      quantity: entity.quantity,
      symbol: entity.symbol,
      method_id: entity.method_id,
      status: entity.status as GatewayPaymentStatusEnum,
      type: entity.type as GatewayPaymentTypeEnum,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      memo: entity.memo,
      payment_details: entity.payment_details,
      blockchain_data: entity.blockchain_data,
      statement: entity.statement,
    };
  }
}
