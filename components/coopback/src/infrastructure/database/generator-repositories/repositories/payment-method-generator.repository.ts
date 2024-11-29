// infrastructure/repositories/organization.repository.ts
import { Injectable } from '@nestjs/common';
import { generator } from '~/services/document.service';
import type { Cooperative } from 'cooptypes';
import type { PaymentMethodRepository } from '~/domain/common/repositories/payment-method.repository';
import { PaymentMethodDomainEntity } from '~/domain/payment-method/entities/method-domain.entity';
import type { GetPaymentMethodsDomainInterface } from '~/domain/payment-method/interfaces/get-payment-methods-input.interface';
import type { PaginationResultDomainInterface } from '~/domain/common/interfaces/pagination.interface';

@Injectable()
export class PaymentMethodRepositoryImplementation implements PaymentMethodRepository {
  async save(data: PaymentMethodDomainEntity): Promise<PaymentMethodDomainEntity> {
    await generator.save('paymentMethod', data as any);
    return data;
  }
  async delete(username: string, method_id: string): Promise<void> {
    await generator.del('paymentMethod', { username, method_id });
  }
  async list(data?: GetPaymentMethodsDomainInterface): Promise<PaginationResultDomainInterface<PaymentMethodDomainEntity>> {
    const filter = data ? (data.username ? { username: data.username } : {}) : {};

    //TODO пагинация здесь не работает. Заработает после выделения генератора в отдельный сервис.
    const result = (await generator.list(
      'paymentMethod',
      filter
    )) as Cooperative.Document.IGetResponse<Cooperative.Payments.IPaymentData>;

    const result2: PaginationResultDomainInterface<PaymentMethodDomainEntity> = {
      items: result.results.map((method) => new PaymentMethodDomainEntity(method)),
      totalCount: result.totalResults,
      totalPages: result.totalPages,
      currentPage: result.page,
    };

    return result2;
  }
}
