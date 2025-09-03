import { ObjectType, Field } from '@nestjs/graphql';
import type { EntrepreneurDetailsDomainInterface } from '~/domain/common/interfaces/entrepreneur-details-domain.interface';

@ObjectType('EntrepreneurDetails')
export class EntrepreneurDetailsDTO implements EntrepreneurDetailsDomainInterface {
  @Field(() => String, { description: 'ИНН' })
  inn: string;

  @Field(() => String, { description: 'ОГРН' })
  ogrn: string;

  constructor(data: EntrepreneurDetailsDomainInterface) {
    this.inn = data.inn;
    this.ogrn = data.ogrn;
  }
}
