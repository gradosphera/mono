import { Injectable } from '@nestjs/common';
import { GatewayInteractor } from '~/domain/gateway/interactors/gateway.interactor';
import type { UpdatePaymentStatusInputDTO } from '../dto/update-payment-status-input.dto';
import type { GetOutgoingPaymentsInputDTO } from '../dto/get-outgoing-payments-input.dto';
import type { OutgoingGatewayPaymentDTO } from '../dto/outgoing-payment.dto';
import type { GatewayPaymentDTO } from '../dto/gateway-payment.dto';
import type { PaginationInputDTO, PaginationResult } from '~/modules/common/dto/pagination.dto';

@Injectable()
export class GatewayService {
  constructor(private readonly gatewayInteractor: GatewayInteractor) {}

  /**
   * Получить список всех платежей (универсальный метод)
   */
  async getPayments(
    filters: GetOutgoingPaymentsInputDTO,
    options: PaginationInputDTO
  ): Promise<PaginationResult<GatewayPaymentDTO>> {
    const result = await this.gatewayInteractor.getOutgoingPayments(filters, options);

    return {
      items: result.items.map((item) => {
        const dto = item.toDTO();
        return {
          ...dto,
          type: 'outgoing',
        } as GatewayPaymentDTO;
      }),
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Обновить статус платежа (универсальный метод)
   */
  async updatePaymentStatus(input: UpdatePaymentStatusInputDTO): Promise<OutgoingGatewayPaymentDTO> {
    if (input.type !== 'outgoing') {
      throw new Error('В настоящее время поддерживаются только исходящие платежи');
    }

    const result = await this.gatewayInteractor.updatePaymentStatus(input);
    return result.toDTO() as OutgoingGatewayPaymentDTO;
  }
}
