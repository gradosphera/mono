import { ObjectType, Field } from '@nestjs/graphql';
import type { OrganizationDetailsDomainInterface } from '~/domain/common/interfaces/organization-details-domain.interface';

@ObjectType('OrganizationDetails')
export class OrganizationDetailsDTO implements OrganizationDetailsDomainInterface {
  @Field(() => String, { description: 'ИНН' })
  inn: string;

  @Field(() => String, { description: 'ОГРН' })
  ogrn: string;

  @Field(() => String, { description: 'КПП' })
  kpp: string;

  constructor(data: OrganizationDetailsDomainInterface) {
    this.inn = data.inn;
    this.ogrn = data.ogrn;
    this.kpp = data.kpp;
  }
}
