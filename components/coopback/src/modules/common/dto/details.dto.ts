import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Details')
export class DetailsGraphQLDTO {
  @Field(() => String, { description: 'ИНН' })
  inn: string;

  @Field(() => String, { description: 'ОГРН' })
  ogrn: string;

  @Field(() => String, { description: 'КПП' })
  kpp: string;

  constructor(data: { inn: string; ogrn: string; kpp: string }) {
    this.inn = data.inn;
    this.ogrn = data.ogrn;
    this.kpp = data.kpp;
  }
}
