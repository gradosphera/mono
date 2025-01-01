import { InputType, Field } from '@nestjs/graphql';

@InputType('OrganizationDetailsInput')
export class OrganizationDetailsInputDTO {
  @Field()
  inn!: string;

  @Field()
  kpp!: string;

  @Field()
  ogrn!: string;
}
