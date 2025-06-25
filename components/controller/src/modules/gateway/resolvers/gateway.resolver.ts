import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/modules/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/modules/auth/guards/roles.guard';
import { AuthRoles } from '~/modules/auth/decorators/auth.decorator';
import { GatewayService } from '../services/gateway.service';
import { UpdatePaymentStatusInputDTO } from '../dto/update-payment-status-input.dto';
import { GetOutgoingPaymentsInputDTO } from '../dto/get-outgoing-payments-input.dto';
import { OutgoingGatewayPaymentDTO } from '../dto/outgoing-payment.dto';
import { GatewayPaymentDTO } from '../dto/gateway-payment.dto';
import { createPaginationResult, PaginationInputDTO, PaginationResult } from '~/modules/common/dto/pagination.dto';

const paginatedPaymentsResult = createPaginationResult(GatewayPaymentDTO, 'PaginatedGatewayPayments');

/**
 * GraphQL резолвер для gateway
 * Обеспечивает API для управления исходящими платежами
 */
@Resolver()
export class GatewayResolver {
  constructor(private readonly gatewayService: GatewayService) {}

  /**
   * Query: Получить список всех платежей (универсальный)
   * Готовится для будущей поддержки входящих платежей
   */
  @Query(() => paginatedPaymentsResult, {
    name: 'getGatewayPayments',
    description: 'Получить список всех платежей (универсальный метод, поддержка входящих платежей в будущем).',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async getGatewayPayments(
    @Args('filters') filters: GetOutgoingPaymentsInputDTO,
    @Args('options') options: PaginationInputDTO
  ): Promise<PaginationResult<GatewayPaymentDTO>> {
    return this.gatewayService.getPayments(filters, options);
  }

  /**
   * Mutation: Обновить статус платежа
   */
  @Mutation(() => OutgoingGatewayPaymentDTO, {
    name: 'updatePaymentStatus',
    description: 'Обновить статус платежа.',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman', 'member'])
  async updatePaymentStatus(@Args('input') input: UpdatePaymentStatusInputDTO): Promise<OutgoingGatewayPaymentDTO> {
    return this.gatewayService.updatePaymentStatus(input);
  }
}
