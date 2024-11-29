import type { PaginationInputDomainInterface } from '~/domain/common/interfaces/pagination.interface';

export interface GetPaymentMethodsDomainInterface extends PaginationInputDomainInterface {
  username?: string;
}
