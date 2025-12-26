import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStateEntity } from '../entities/payment-state.entity';
import type { PaymentStateRepository, IPaymentState } from '~/domain/gateway/repositories/payment-state.repository';

@Injectable()
export class TypeormPaymentStateRepository implements PaymentStateRepository {
  constructor(
    @InjectRepository(PaymentStateEntity)
    private readonly paymentStateRepository: Repository<PaymentStateEntity>
  ) {}

  async findOne(accountNumber: string, statementDate: string): Promise<IPaymentState | null> {
    const entity = await this.paymentStateRepository.findOne({
      where: { accountNumber, statementDate },
    });

    return entity ? entity.toDomainEntity() : null;
  }

  async save(data: IPaymentState): Promise<IPaymentState> {
    const entity = PaymentStateEntity.fromDomainEntity(data);
    const savedEntity = await this.paymentStateRepository.save(entity);
    return savedEntity.toDomainEntity();
  }
}
