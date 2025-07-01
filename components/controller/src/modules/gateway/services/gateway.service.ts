import { Injectable } from '@nestjs/common';
import { GatewayInteractor } from '~/domain/gateway/interactors/gateway.interactor';
import { UserCertificateInteractor } from '~/domain/user-certificate/interactors/user-certificate.interactor';
import type { GatewayPaymentDTO } from '../dto/gateway-payment.dto';
import type { PaginationInputDTO, PaginationResult } from '~/modules/common/dto/pagination.dto';
import type { SetPaymentStatusInputDTO } from '../dto/set-payment-status-input.dto';
import type { PaymentFiltersDomainInterface } from '~/domain/gateway/interfaces/payment-filters-domain.interface';

@Injectable()
export class GatewayService {
  constructor(
    private readonly gatewayInteractor: GatewayInteractor,
    private readonly userCertificateInteractor: UserCertificateInteractor
  ) {}

  /**
   * Получить платежи с фильтрацией (универсальный метод)
   */
  async getPayments(
    filters: PaymentFiltersDomainInterface = {},
    options: PaginationInputDTO = { page: 1, limit: 10, sortOrder: 'DESC' }
  ): Promise<PaginationResult<GatewayPaymentDTO>> {
    // Приводим внешние фильтры к внутренним (без secret)
    const result = await this.gatewayInteractor.getPayments(filters, options);

    // Обогащаем каждый элемент сертификатом пользователя
    const enrichedItems = await Promise.all(
      result.items.map(async (item) => {
        const usernameCertificate = await this.userCertificateInteractor.getCertificateByUsername(item.username);
        return item.toDTO(usernameCertificate);
      })
    );

    return {
      items: enrichedItems,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
    };
  }

  /**
   * Установить статус платежа
   */
  async setPaymentStatus(data: SetPaymentStatusInputDTO): Promise<GatewayPaymentDTO> {
    const result = await this.gatewayInteractor.setPaymentStatus(data);
    const usernameCertificate = await this.userCertificateInteractor.getCertificateByUsername(result.username);
    return result.toDTO(usernameCertificate);
  }
}
