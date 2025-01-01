// payment-method.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { GetPaymentMethodsInputDTO } from '../dto/get-payment-methods-input.dto';
import { PaymentMethodService } from '../services/payment-method.service';
import { UpdateBankAccountInputDTO } from '../dto/update-bank-account-input.dto';
import { DeletePaymentMethodDTO } from '../dto/delete-payment-method-input.dto';
import { CreateBankAccountInputDTO } from '../dto/create-bank-account-input.dto';
import { PaymentMethodDomainEntity } from '~/domain/payment-method/entities/method-domain.entity';
import { PaymentMethodDTO } from '../dto/payment-method.dto';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';
import { createPaginationResult } from '~/modules/common/dto/pagination.dto';

const PaymentMethodPaginationResult = createPaginationResult(PaymentMethodDTO, 'PaymentMethod');

@Resolver('PaymentMethod')
export class PaymentMethodResolver {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Query(() => PaymentMethodPaginationResult, {
    name: 'getPaymentMethods',
    description: 'Получить список методов оплаты',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async getPaymentMethods(
    @Args('data', { type: () => GetPaymentMethodsInputDTO, nullable: true }) data?: GetPaymentMethodsInputDTO
  ): Promise<PaginationResultDomainInterface<PaymentMethodDomainEntity>> {
    return this.paymentMethodService.listPaymentMethods(data);
  }

  @Mutation(() => PaymentMethodDTO, { name: 'createBankAccount', description: 'Добавить метод оплаты' })
  @UseGuards(GqlJwtAuthGuard)
  async createBankAccount(
    @Args('data', { type: () => CreateBankAccountInputDTO }) data: CreateBankAccountInputDTO
  ): Promise<PaymentMethodDTO> {
    return await this.paymentMethodService.createBankAccount(data);
  }

  @Mutation(() => PaymentMethodDTO, { name: 'updateBankAccount', description: 'Обновить банковский счёт' })
  @UseGuards(GqlJwtAuthGuard)
  async updateBankAccount(
    @Args('data', { type: () => UpdateBankAccountInputDTO }) data: UpdateBankAccountInputDTO
  ): Promise<PaymentMethodDTO> {
    return await this.paymentMethodService.updateBankAccount(data);
  }

  @Mutation(() => Boolean, { name: 'deletePaymentMethod', description: 'Удалить метод оплаты' })
  @UseGuards(GqlJwtAuthGuard)
  async deletePaymentMethod(
    @Args('data', { type: () => DeletePaymentMethodDTO }) data: DeletePaymentMethodDTO
  ): Promise<boolean> {
    await this.paymentMethodService.deletePaymentMethod(data);
    return true;
  }
}
