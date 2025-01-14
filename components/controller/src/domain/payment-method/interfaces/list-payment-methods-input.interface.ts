import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

export interface ListPaymentMethodsDomainInterface extends PaginationInputDomainInterface {
  username?: string;
}
