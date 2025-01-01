import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { PaymentService } from '../services/payment.service';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { createPaginationResult, PaginationInputDTO } from '~/modules/common/dto/pagination.dto';
import { PaymentDTO } from '../dto/payment.dto';
import { GetPaymentsInputDTO } from '../dto/get-payments-input.dto';
import { CreateInitialPaymentInputDTO } from '../dto/create-initial-payment.dto';
import { CreateDepositPaymentInputDTO } from '../dto/create-deposit-input.dto';
import { SetPaymentStatusInputDTO } from '../dto/set-payment-status-input.dto';

const PaymentPaginationResult = createPaginationResult(PaymentDTO, 'Payment');

@Resolver('Payment')
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Query(() => PaymentPaginationResult, {
    name: 'getPayments',
    description: 'Получить список платежей',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member']) //user разрешено извлекать только свои собственные данные по условию guard
  async getPayments(
    @Args('data', { type: () => GetPaymentsInputDTO, nullable: true }) data: GetPaymentsInputDTO,
    @Args('options', { type: () => PaginationInputDTO, nullable: true }) options: PaginationInputDTO
  ): Promise<PaginationResultDomainInterface<PaymentDTO>> {
    return this.paymentService.getPayments(data, options);
  }

  @Mutation(() => PaymentDTO, {
    name: 'createInitialPayment',
    description: 'Создать объект платежа вступительного взноса',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async createInitialPayment(
    @Args('data', { type: () => CreateInitialPaymentInputDTO }) data: CreateInitialPaymentInputDTO
  ): Promise<PaymentDTO> {
    return await this.paymentService.createInitialPayment(data);
  }

  @Mutation(() => PaymentDTO, {
    name: 'createDeposit',
    description: 'Создать объект платежа вступительного взноса',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member', 'user'])
  async createDeposit(
    @Args('data', { type: () => CreateDepositPaymentInputDTO }) data: CreateDepositPaymentInputDTO
  ): Promise<PaymentDTO> {
    return await this.paymentService.createDeposit(data);
  }

  @Mutation(() => PaymentDTO, {
    name: 'setPaymentStatus',
    description: 'Создать объект платежа вступительного взноса',
  })
  @UseGuards(GqlJwtAuthGuard)
  @AuthRoles(['chairman', 'member'])
  async setPaymentStatus(
    @Args('data', { type: () => SetPaymentStatusInputDTO }) data: SetPaymentStatusInputDTO
  ): Promise<PaymentDTO> {
    return await this.paymentService.setPaymentStatus(data);
  }
}
